-- Create table for Class Assignments
create table class_assignments (
  id uuid default gen_random_uuid() primary key,
  class_id uuid references classes(id) on delete cascade not null,
  teacher_id uuid references auth.users(id) not null,
  topic text not null,
  questions jsonb not null, -- Stores the generated questions array
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  question_count int default 5,
  question_types text[] -- Array of types e.g. ['mcq', 'free']
);

-- Enable RLS for class_assignments
alter table class_assignments enable row level security;

-- Policies for class_assignments
-- Teachers can view/create their own assignments
create policy "Teachers can view their own assignments"
  on class_assignments for select
  using (auth.uid() = teacher_id);

create policy "Teachers can insert their own assignments"
  on class_assignments for insert
  with check (auth.uid() = teacher_id);

-- Students can view assignments for classes they are enrolled in
create policy "Students can view assignments for their classes"
  on class_assignments for select
  using (
    exists (
      select 1 from class_enrollments
      where class_enrollments.class_id = class_assignments.class_id
      and class_enrollments.student_id = auth.uid()
    )
  );


-- Create table for Student Assignment Progress
create table student_assignment_progress (
  id uuid default gen_random_uuid() primary key,
  assignment_id uuid references class_assignments(id) on delete cascade not null,
  student_id uuid references auth.users(id) not null,
  status text default 'pending', -- 'pending', 'completed'
  score int,
  completed_at timestamp with time zone,
  answers jsonb, -- Stores student's answers
  unique(assignment_id, student_id)
);

-- Enable RLS for student_assignment_progress
alter table student_assignment_progress enable row level security;

-- Policies for student_assignment_progress
-- Students can view and update their own progress
create policy "Students can view their own progress"
  on student_assignment_progress for select
  using (auth.uid() = student_id);

create policy "Students can insert their own progress"
  on student_assignment_progress for insert
  with check (auth.uid() = student_id);

create policy "Students can update their own progress"
  on student_assignment_progress for update
  using (auth.uid() = student_id);

-- Teachers can view progress for their assignments
create policy "Teachers can view progress for their assignments"
  on student_assignment_progress for select
  using (
    exists (
      select 1 from class_assignments
      where class_assignments.id = student_assignment_progress.assignment_id
      and class_assignments.teacher_id = auth.uid()
    )
  );
