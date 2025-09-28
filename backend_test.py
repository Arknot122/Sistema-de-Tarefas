import requests
import sys
import json
from datetime import datetime, timezone

class MarketingConsultancyAPITester:
    def __init__(self, base_url="https://demand-hub-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_user_id = None
        self.test_campaign_id = None
        self.test_task_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        print(f"   Method: {method}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_user_registration(self):
        """Test user registration"""
        test_email = f"test_user_{datetime.now().strftime('%H%M%S')}@example.com"
        user_data = {
            "email": test_email,
            "name": "Test User",
            "password": "TestPass123!",
            "role": "account_manager"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=user_data
        )
        
        if success and 'id' in response:
            self.test_user_id = response['id']
            print(f"   Created user with ID: {self.test_user_id}")
            return test_email, "TestPass123!"
        return None, None

    def test_user_login(self, email, password):
        """Test user login and get token"""
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data={"email": email, "password": password}
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"   Got access token: {self.token[:20]}...")
            return True
        return False

    def test_get_current_user(self):
        """Test getting current user info"""
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        return success

    def test_create_campaign(self):
        """Test campaign creation"""
        campaign_data = {
            "title": "Test Marketing Campaign",
            "description": "A test campaign for API testing",
            "campaign_type": "digital_marketing",
            "client_name": "Test Client Inc.",
            "budget": 50000.0,
            "start_date": datetime.now(timezone.utc).isoformat(),
            "end_date": datetime.now(timezone.utc).isoformat(),
            "assigned_team": []
        }
        
        success, response = self.run_test(
            "Create Campaign",
            "POST",
            "campaigns",
            200,
            data=campaign_data
        )
        
        if success and 'id' in response:
            self.test_campaign_id = response['id']
            print(f"   Created campaign with ID: {self.test_campaign_id}")
            return True
        return False

    def test_get_campaigns(self):
        """Test getting all campaigns"""
        success, response = self.run_test(
            "Get Campaigns",
            "GET",
            "campaigns",
            200
        )
        
        if success:
            print(f"   Found {len(response)} campaigns")
        return success

    def test_get_campaign_by_id(self):
        """Test getting a specific campaign"""
        if not self.test_campaign_id:
            print("❌ No campaign ID available for testing")
            return False
            
        success, response = self.run_test(
            "Get Campaign by ID",
            "GET",
            f"campaigns/{self.test_campaign_id}",
            200
        )
        return success

    def test_create_task(self):
        """Test task creation"""
        if not self.test_campaign_id:
            print("❌ No campaign ID available for task creation")
            return False
            
        task_data = {
            "title": "Test Task",
            "description": "A test task for API testing",
            "campaign_id": self.test_campaign_id,
            "priority": "medium",
            "due_date": datetime.now(timezone.utc).isoformat(),
            "estimated_hours": 8.0,
            "dependencies": []
        }
        
        success, response = self.run_test(
            "Create Task",
            "POST",
            "tasks",
            200,
            data=task_data
        )
        
        if success and 'id' in response:
            self.test_task_id = response['id']
            print(f"   Created task with ID: {self.test_task_id}")
            return True
        return False

    def test_get_tasks(self):
        """Test getting all tasks"""
        success, response = self.run_test(
            "Get Tasks",
            "GET",
            "tasks",
            200
        )
        
        if success:
            print(f"   Found {len(response)} tasks")
        return success

    def test_get_task_by_id(self):
        """Test getting a specific task"""
        if not self.test_task_id:
            print("❌ No task ID available for testing")
            return False
            
        success, response = self.run_test(
            "Get Task by ID",
            "GET",
            f"tasks/{self.test_task_id}",
            200
        )
        return success

    def test_update_task(self):
        """Test updating a task"""
        if not self.test_task_id:
            print("❌ No task ID available for updating")
            return False
            
        update_data = {
            "status": "in_progress",
            "actual_hours": 4.0
        }
        
        success, response = self.run_test(
            "Update Task",
            "PUT",
            f"tasks/{self.test_task_id}",
            200,
            data=update_data
        )
        return success

    def test_get_team_members(self):
        """Test getting team members"""
        success, response = self.run_test(
            "Get Team Members",
            "GET",
            "team",
            200
        )
        
        if success:
            print(f"   Found {len(response)} team members")
        return success

    def test_get_team_member_by_id(self):
        """Test getting a specific team member"""
        if not self.test_user_id:
            print("❌ No user ID available for testing")
            return False
            
        success, response = self.run_test(
            "Get Team Member by ID",
            "GET",
            f"team/{self.test_user_id}",
            200
        )
        return success

    def test_update_team_member(self):
        """Test updating a team member"""
        if not self.test_user_id:
            print("❌ No user ID available for updating")
            return False
            
        update_data = {
            "name": "Updated Test User",
            "role": "creative_director",
            "is_active": True
        }
        
        success, response = self.run_test(
            "Update Team Member",
            "PUT",
            f"team/{self.test_user_id}",
            200,
            data=update_data
        )
        return success

    def test_create_team_member_via_register(self):
        """Test creating another team member via registration"""
        test_email = f"team_member_{datetime.now().strftime('%H%M%S')}@example.com"
        user_data = {
            "email": test_email,
            "name": "Team Member Test",
            "password": "TeamPass123!",
            "role": "designer"
        }
        
        success, response = self.run_test(
            "Create Team Member (Register)",
            "POST",
            "auth/register",
            200,
            data=user_data
        )
        
        if success and 'id' in response:
            self.second_user_id = response['id']
            print(f"   Created second user with ID: {self.second_user_id}")
            return True
        return False

    def test_assign_task_to_team_member(self):
        """Test assigning a task to a team member"""
        if not self.test_campaign_id or not hasattr(self, 'second_user_id'):
            print("❌ No campaign ID or second user ID available for task assignment")
            return False
            
        task_data = {
            "title": "Team Assignment Test Task",
            "description": "A task assigned to a team member",
            "campaign_id": self.test_campaign_id,
            "assignee_id": self.second_user_id,
            "priority": "high",
            "due_date": datetime.now(timezone.utc).isoformat(),
            "estimated_hours": 6.0,
            "dependencies": []
        }
        
        success, response = self.run_test(
            "Assign Task to Team Member",
            "POST",
            "tasks",
            200,
            data=task_data
        )
        
        if success and 'id' in response:
            self.assigned_task_id = response['id']
            print(f"   Created assigned task with ID: {self.assigned_task_id}")
            return True
        return False

    def test_get_tasks_for_team_member(self):
        """Test getting tasks filtered by team member"""
        if not self.test_campaign_id:
            print("❌ No campaign ID available for filtering tasks")
            return False
            
        success, response = self.run_test(
            "Get Tasks for Campaign",
            "GET",
            f"tasks?campaign_id={self.test_campaign_id}",
            200
        )
        
        if success:
            assigned_tasks = [task for task in response if task.get('assignee_id') == getattr(self, 'second_user_id', None)]
            print(f"   Found {len(assigned_tasks)} tasks assigned to team member")
        return success

    def test_get_dashboard_stats(self):
        """Test getting dashboard statistics"""
        success, response = self.run_test(
            "Get Dashboard Stats",
            "GET",
            "dashboard/stats",
            200
        )
        
        if success:
            print(f"   Dashboard stats: {json.dumps(response, indent=2)}")
        return success

    def test_delete_task(self):
        """Test deleting a task"""
        if not self.test_task_id:
            print("❌ No task ID available for deletion")
            return False
            
        success, response = self.run_test(
            "Delete Task",
            "DELETE",
            f"tasks/{self.test_task_id}",
            200
        )
        return success

def main():
    print("🚀 Starting Marketing Consultancy API Tests")
    print("=" * 50)
    
    tester = MarketingConsultancyAPITester()
    
    # Test user registration and login
    email, password = tester.test_user_registration()
    if not email:
        print("❌ User registration failed, stopping tests")
        return 1
    
    if not tester.test_user_login(email, password):
        print("❌ User login failed, stopping tests")
        return 1
    
    # Test authenticated endpoints
    tester.test_get_current_user()
    
    # Test campaign operations
    tester.test_create_campaign()
    tester.test_get_campaigns()
    tester.test_get_campaign_by_id()
    
    # Test team management operations
    tester.test_create_team_member_via_register()
    tester.test_get_team_members()
    tester.test_get_team_member_by_id()
    tester.test_update_team_member()
    
    # Test task operations
    tester.test_create_task()
    tester.test_get_tasks()
    tester.test_get_task_by_id()
    tester.test_update_task()
    
    # Test team task assignment
    tester.test_assign_task_to_team_member()
    tester.test_get_tasks_for_team_member()
    
    # Test other endpoints
    tester.test_get_dashboard_stats()
    
    # Cleanup
    tester.test_delete_task()
    if hasattr(tester, 'assigned_task_id'):
        tester.test_task_id = tester.assigned_task_id
        tester.test_delete_task()
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print(f"❌ {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())