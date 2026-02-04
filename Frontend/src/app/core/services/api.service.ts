import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Task } from '../models/task.model';
import { Comment } from '../models/comment.model';
import { Project } from '../models/project.model';
import { User } from '../models/user.model';
import { MoveTaskRequest } from '../models/move-task-request.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

// projects
getProjects() {
  return this.http.get<Project[]>(`${this.baseUrl}/projects`);
}

getProject(id: number) {
  return this.http.get<Project>(`${this.baseUrl}/projects/${id}`);
}

createProject(project: Project) {
  return this.http.post<{ projectId: number }>(`${this.baseUrl}/projects`, project);
}

updateProject(id: number, project: Project) {
  return this.http.put(`${this.baseUrl}/projects/${id}`, project);
}

deleteProject(id: number) {
  return this.http.delete(`${this.baseUrl}/projects/${id}`);
}

enableProject(id: number) {
  return this.http.post(`${this.baseUrl}/projects/${id}/enable`, {});
}

disableProject(id: number) {
  return this.http.post(`${this.baseUrl}/projects/${id}/disable`, {});
}

  getTasks(projectId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.baseUrl}/projects/${projectId}/tasks`);
  }

  // Tasks
  createTask(task: Task) {
    return this.http.post(`${this.baseUrl}/tasks`, task);
  }

updateTask(task: Task) {
  return this.http.put(`${this.baseUrl}/tasks/${task.id}`, task);
}

  deleteTask(taskId: number) {
    return this.http.delete(`${this.baseUrl}/tasks/${taskId}`);
  }

moveTask(taskId: number, request: MoveTaskRequest): Observable<{ success: boolean }> {
  return this.http.post<{ success: boolean }>(
    `${this.baseUrl}/tasks/${taskId}/move`, // ✅ Now uses correct baseUrl
    request
  );
}

  getTaskComments(taskId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.baseUrl}/tasks/${taskId}/comments`);
  }

  addTaskComment(taskId: number, payload: { text: string; userId?: number | null }): Observable<Comment> {
    return this.http.post<Comment>(`${this.baseUrl}/tasks/${taskId}/comments`, payload);
  }

  deleteTaskComment(taskId: number, commentId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/tasks/${taskId}/comments/${commentId}`);
  }

  login(userId: number): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/auth/login`, { userId });
  }

  // Users
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users`);
  }

  addUser(user: User) {
    return this.http.post<User>(`${this.baseUrl}/users`, user);
  }
  
  updateUser(user: User) {
    return this.http.put<User>(`${this.baseUrl}/users/${user.id}`, user);
  }
  deleteUser(userId: number) {
    return this.http.delete(`${this.baseUrl}/users/${userId}`);
  }
}
