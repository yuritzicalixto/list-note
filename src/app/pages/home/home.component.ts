import { CommonModule } from '@angular/common';
import { Component, Injector, computed, effect, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl, Validators} from '@angular/forms';
/*Importa la interfaz creada para task*/
import { Task} from './../models/task.module';



@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  tasks = signal<Task[]> ([]);

  filter = signal<'all' | 'pending' | 'completed'>('all');
  tasksByFilter = computed(()=>{
    const filter = this.filter();
    const tasks = this.tasks();
    if (filter === 'pending'){
      return tasks.filter(task => !task.completed)
    }
    if (filter === 'completed'){
      return tasks.filter(task => task.completed)
    }
    return tasks;
  })

  /*Controlador para crear nuevas tareas*/
  /*Instancia directa de un FormControl*/
  newTaskCtrl = new FormControl('', {
    nonNullable: true,
    validators: [
      Validators.required,
      // Validators.pattern('^\\S.*$'),

    ]
  });

  injector = inject(Injector);

  ngOnInit(){
    const storage = localStorage.getItem('tasks');
    if(storage){
      const tasks = JSON.parse(storage);
      this.tasks.set(tasks);
    }
    this.trackTasks();
  }

  trackTasks(){
    effect(() => {
      const tasks = this.tasks();
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }, { injector: this.injector });
  }

  /*Recibir el valor del input*/
  changeHandler(){
    /*const input = event.target as HTMLInputElement;
    const newTask = input.value;*/
    if(this.newTaskCtrl.valid){
      const value = this.newTaskCtrl.value.trim();
      if(value !== ''){
        this.addTask(value);
      /*Limpiearemos el valor del input*/
      this.newTaskCtrl.setValue('');
      }
    }

  }

  /*Marca que la tarea esta realizada*/
  toggleChecked(index:number){
    this.tasks.update((value) =>
    value.map((task, position) => {
      if (position === index)
        return{
          ...task,
          completed: !task.completed,
        };
        return task;
    })
    )
  }

  /*Agregar una tarea*/
  addTask(title: string){
    const newTask = {
      id: Date.now(),
      title,
      completed: false,
    };
    this.tasks.update((tasks)=> [...tasks, newTask]);
  }

  /*Eliminar la tarea*/
  deleteTask(index: number){
    this.tasks.update((tasks) => tasks.filter((task, position)=> position !== index));
    /*Con base al estado anterior (el array con todas la tareas) dejando a fuera de esa posicion, creando un nuevo estado sin esa tarea */
  }

  updateTask(index: number){
    this.tasks.update((tasks) =>{
      return tasks.map((tasks, position) =>{
        if(position === index) {
          return {
            ...tasks,
            completed: !tasks.completed
          }
        }
        return tasks;
      })
    })
  }

  updateTaskEditingMode(index: number){
    this.tasks.update(prevState => {
      return prevState.map((task, position) => {
        if(position === index){
          return {
            ...task,
            editing: true
          }
        }
        return {
          ...task,
          editing: false
        };
      })
    });
  }

  updateTaskText(index: number, event: Event){
    const input = event.target as HTMLInputElement;
    this.tasks.update(prevState => {
      return prevState.map((task, position) => {
        if(position === index){
          return {
            ...task,
            title: input.value,
            editing: false
          }
        }
        return task;
      })
    });
  }

  changeFilter(filter:'all' | 'pending' | 'completed') {
    this.filter.set(filter);
  }


}
