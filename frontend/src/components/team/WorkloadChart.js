import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { 
  Clock, 
  CheckSquare, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

const WorkloadChart = ({ teamMembers, tasks, campaigns }) => {
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getMemberWorkload = (memberId) => {
    const memberTasks = tasks.filter(task => task.assignee_id === memberId);
    const activeTasks = memberTasks.filter(task => task.status !== 'completed');
    const completedTasks = memberTasks.filter(task => task.status === 'completed');
    const overdueTasks = memberTasks.filter(task => 
      task.due_date && 
      new Date(task.due_date) < new Date() && 
      task.status !== 'completed'
    );

    const totalHours = memberTasks.reduce((sum, task) => 
      sum + (task.estimated_hours || 0), 0
    );
    
    const activeHours = activeTasks.reduce((sum, task) => 
      sum + (task.estimated_hours || 0), 0
    );

    const completionRate = memberTasks.length > 0 
      ? (completedTasks.length / memberTasks.length) * 100 
      : 0;

    return {
      memberId,
      totalTasks: memberTasks.length,
      activeTasks: activeTasks.length,
      completedTasks: completedTasks.length,
      overdueTasks: overdueTasks.length,
      totalHours,
      activeHours,
      completionRate
    };
  };

  const getWorkloadLevel = (activeTasks) => {
    if (activeTasks === 0) return { level: 'light', color: 'bg-gray-500', label: 'Available' };
    if (activeTasks <= 3) return { level: 'light', color: 'bg-green-500', label: 'Light' };
    if (activeTasks <= 6) return { level: 'moderate', color: 'bg-yellow-500', label: 'Moderate' };
    return { level: 'heavy', color: 'bg-red-500', label: 'Heavy' };
  };

  const getPerformanceIndicator = (completionRate) => {
    if (completionRate >= 80) return { icon: TrendingUp, color: 'text-green-600', label: 'High' };
    if (completionRate >= 60) return { icon: Minus, color: 'text-yellow-600', label: 'Average' };
    return { icon: TrendingDown, color: 'text-red-600', label: 'Low' };
  };

  const workloadData = teamMembers
    .filter(member => member.is_active)
    .map(member => ({
      ...member,
      workload: getMemberWorkload(member.id)
    }))
    .sort((a, b) => b.workload.activeTasks - a.workload.activeTasks);

  const maxActiveHours = Math.max(...workloadData.map(m => m.workload.activeHours), 1);

  return (
    <div className="space-y-6">
      <Card className="p-6 border-0 shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-black">Team Workload Overview</h3>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Light</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Moderate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Heavy</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {workloadData.map((member) => {
            const workloadLevel = getWorkloadLevel(member.workload.activeTasks);
            const performance = getPerformanceIndicator(member.workload.completionRate);
            const PerformanceIcon = performance.icon;
            
            return (
              <div key={member.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-yellow-400 text-black font-medium text-sm">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium text-black">{member.name}</h4>
                      <p className="text-sm text-gray-600 capitalize">
                        {member.role.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge className={`${workloadLevel.color} text-white border-0`}>
                      {workloadLevel.label}
                    </Badge>
                    <div className={`flex items-center gap-1 ${performance.color}`}>
                      <PerformanceIcon className="h-4 w-4" />
                      <span className="text-sm font-medium">{performance.label}</span>
                    </div>
                  </div>
                </div>

                {/* Workload Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">
                      {member.workload.activeHours}h / {member.workload.totalHours}h total
                    </span>
                    <span className="text-gray-600">
                      {member.workload.completionRate.toFixed(0)}% completion rate
                    </span>
                  </div>
                  <Progress 
                    value={(member.workload.activeHours / maxActiveHours) * 100} 
                    className="h-2"
                  />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="font-medium text-black">{member.workload.activeTasks}</p>
                      <p className="text-gray-600">Active Tasks</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="font-medium text-black">{member.workload.completedTasks}</p>
                      <p className="text-gray-600">Completed</p>
                    </div>
                  </div>
                  
                  {member.workload.overdueTasks > 0 && (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <div>
                        <p className="font-medium text-red-600">{member.workload.overdueTasks}</p>
                        <p className="text-gray-600">Overdue</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {workloadData.length === 0 && (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No active team members found</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default WorkloadChart;