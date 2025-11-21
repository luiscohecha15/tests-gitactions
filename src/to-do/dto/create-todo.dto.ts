export class CreateTodoDto {
  name: string;
  description?: string;
  is_complete?: boolean;
  user: string; 
}
