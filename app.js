// Life Management Hub - Complete Implementation
class LifeHub {
    constructor() {
        this.data = {
            events: [],
            todos: [],
            goals: [],
            income: [],
            expenses: [],
            assets: [],
            health: [],
            contacts: [],
            globalTaxRate: 25,
            autoSavings: {
                enabled: false,
                targetAssetId: null,
                appreciationRate: 4
            }
        };
        
        this.currentWeek = new Date();
        this.currentModule = 'schedule';
        this.charts = {};
        this.healthCharts = {
            trends: null,
            moodPie: null,
            exerciseMood: null,
            sleepMood: null
        };
        
        this.loadData();
        this.initializeApp();
    }
    
    initializeApp() {
        this.setupNavigation();
        this.setupEventListeners();
        this.renderCurrentModule();
        this.loadFinanceCharts();
    }
    
    setupNavigation() {
        // Main navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const module = e.target.dataset.module;
                this.switchModule(module);
            });
        });
        
        // Sub navigation
        document.querySelectorAll('.sub-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const view = e.target.dataset.view;
                this.switchSubView(view);
            });
        });
        
        // Filter tabs
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.applyFilter(filter);
            });
        });
    }
    
    setupEventListeners() {
        // Calendar controls
        document.getElementById('prev-week').addEventListener('click', () => this.changeWeek(-1));
        document.getElementById('next-week').addEventListener('click', () => this.changeWeek(1));
        document.getElementById('today-btn').addEventListener('click', () => this.goToToday());
        
        // Add buttons
        document.getElementById('add-todo-btn').addEventListener('click', () => this.showTodoModal());
        document.getElementById('add-goal-btn').addEventListener('click', () => this.showGoalModal());
        document.getElementById('add-income-btn').addEventListener('click', () => this.showIncomeModal());
        document.getElementById('add-expense-btn').addEventListener('click', () => this.showExpenseModal());
        document.getElementById('add-asset-btn').addEventListener('click', () => this.showAssetModal());
        document.getElementById('add-health-log-btn').addEventListener('click', () => this.showHealthModal());
        document.getElementById('add-contact-btn').addEventListener('click', () => this.showContactModal());
        document.getElementById('saves-btn').addEventListener('click', () => this.showSavesModal());
        
        // Tax rate change
        document.getElementById('tax-rate').addEventListener('input', (e) => {
            this.data.globalTaxRate = parseFloat(e.target.value) || 0;
            this.saveData();
            this.updateFinanceDashboard();
        });
        
        // Health timeframe
        document.getElementById('health-timeframe').addEventListener('change', () => {
            this.renderHealthDashboard();
        });
        
        // Trajectory timeframe
        document.getElementById('trajectory-timeframe').addEventListener('change', () => {
            this.renderAssetTrajectory();
        });
        
        // Modal close with confirmation
        this.initializeModalHandlers();
    }
    
    switchModule(module) {
        this.currentModule = module;
        
        // Update nav
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.module === module);
        });
        
        // Update modules
        document.querySelectorAll('.module').forEach(mod => {
            mod.classList.toggle('active', mod.id === `${module}-module`);
        });
        
        this.renderCurrentModule();
    }
    
    switchSubView(view) {
        // Update sub tabs
        document.querySelectorAll('.sub-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.view === view);
        });
        
        // Update sub views
        document.querySelectorAll('.sub-view').forEach(subView => {
            subView.classList.toggle('active', subView.id === `${view}-view`);
        });
        
        if (view === 'dashboard' && this.currentModule === 'finance') {
            setTimeout(() => this.loadFinanceCharts(), 100);
        }
    }
    
    applyFilter(filter) {
        // Update filter tabs
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.filter === filter);
        });
        
        this.renderCurrentModule();
    }
    
    renderCurrentModule() {
        switch (this.currentModule) {
            case 'schedule':
                this.renderCalendar();
                this.renderTodos();
                break;
            case 'goals':
                this.renderGoals();
                break;
            case 'finance':
                this.renderFinance();
                break;
            case 'health':
                this.renderHealthDashboard();
                break;
            case 'contacts':
                this.renderContactsNetwork();
                break;
        }
    }
    
    // CALENDAR & SCHEDULE
    renderCalendar() {
        const startOfWeek = this.getStartOfWeek(this.currentWeek);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        document.getElementById('week-range').textContent = 
            `${this.formatDate(startOfWeek)} - ${this.formatDate(endOfWeek)}`;
        
        const grid = document.getElementById('calendar-grid');
        grid.innerHTML = '';
        
        // Create header
        const header = document.createElement('div');
        header.className = 'calendar-header';
        header.innerHTML = `
            <div>Time</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
            <div>Sun</div>
        `;
        grid.appendChild(header);
        
        // Create body
        const body = document.createElement('div');
        body.className = 'calendar-body';
        
        // Generate time slots (6 AM to 11 PM)
        for (let hour = 6; hour <= 23; hour++) {
            const timeSlot = document.createElement('div');
            timeSlot.className = 'time-slot';
            timeSlot.textContent = this.formatTime(hour, 0);
            body.appendChild(timeSlot);
            
            // Create cells for each day
            for (let day = 0; day < 7; day++) {
                const cell = document.createElement('div');
                cell.className = 'calendar-cell';
                
                const cellDate = new Date(startOfWeek);
                cellDate.setDate(startOfWeek.getDate() + day);
                
                cell.dataset.date = this.formatDateISO(cellDate);
                cell.dataset.hour = hour;
                
                cell.addEventListener('click', () => this.createEvent(cellDate, hour));
                
                // Add events to this cell
                this.addEventsToCell(cell, cellDate, hour);
                
                body.appendChild(cell);
            }
        }
        
        grid.appendChild(body);
    }
    
    addEventsToCell(cell, date, hour) {
        const dateStr = this.formatDateISO(date);
        
        const startOfWeek = this.getStartOfWeek(this.currentWeek);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        // Get all events for this date (including recurring instances)
        const allEvents = this.getAllEventsForDateInWeek(date, startOfWeek, endOfWeek);
        
        allEvents.forEach(event => {
            const eventStart = parseInt(event.startTime.split(':')[0]);
            const eventEnd = parseInt(event.endTime.split(':')[0]);
            
            if (hour >= eventStart && hour < eventEnd) {
                const eventBlock = document.createElement('div');
                eventBlock.className = 'event-block';
                if (event.recurring) {
                    eventBlock.classList.add('event-recurring');
                }
                
                eventBlock.innerHTML = `
                    ${event.recurring ? '🔄 ' : ''}${event.title}
                `;
                
                eventBlock.style.top = '2px';
                eventBlock.style.height = `${(eventEnd - eventStart) * 60 - 4}px`;
                eventBlock.style.background = event.color || '#667eea';
                
                if (!event.isInstance) {
                    eventBlock.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.editEvent(event);
                    });
                }
                
                cell.appendChild(eventBlock);
            }
        });
    }
    
    getAllEventsForDateInWeek(targetDate, weekStart, weekEnd) {
        const result = [];
        const targetDateStr = this.formatDateISO(targetDate);
        
        this.data.events.forEach(event => {
            // Add original event if it matches
            if (event.date === targetDateStr) {
                result.push(event);
            }
            
            // Add recurring instances if applicable
            if (event.recurring && event.recurringFrequency) {
                const instances = this.generateRecurringInstances(event, weekStart, weekEnd);
                result.push(...instances.filter(instance => instance.date === targetDateStr));
            }
        });
        
        return result;
    }
    
    generateRecurringInstances(event, weekStart, weekEnd) {
        if (!event.recurring) return [];
        
        const instances = [];
        let current = new Date(event.date + 'T00:00:00');
        const end = event.endRecurring ? new Date(event.endRecurring + 'T00:00:00') : weekEnd;
        
        while (current <= end && current <= weekEnd) {
            if (current >= weekStart && this.formatDateISO(current) !== event.date) {
                
                // Check if this day matches selected days
                if (event.recurringFrequency === 'weekly' || event.recurringFrequency === 'biweekly') {
                    const dayOfWeek = current.getDay(); // 0=Sun, 1=Mon, etc
                    
                    if (event.selectedDays && event.selectedDays[dayOfWeek]) {
                        instances.push({
                            ...event,
                            date: this.formatDateISO(current),
                            isInstance: true
                        });
                    }
                } else if (event.recurringFrequency === 'daily') {
                    instances.push({
                        ...event,
                        date: this.formatDateISO(current),
                        isInstance: true
                    });
                } else if (event.recurringFrequency === 'monthly') {
                    // Only on same day of month as original
                    if (current.getDate() === new Date(event.date).getDate()) {
                        instances.push({
                            ...event,
                            date: this.formatDateISO(current),
                            isInstance: true
                        });
                    }
                }
            }
            
            // Increment by 1 day for daily/weekly/biweekly to check each day
            if (event.recurringFrequency === 'daily' || event.recurringFrequency === 'weekly' || event.recurringFrequency === 'biweekly') {
                current.setDate(current.getDate() + 1);
                
                // For bi-weekly, after checking 14 days, jump to next cycle
                if (event.recurringFrequency === 'biweekly') {
                    const daysSinceStart = Math.floor((current - new Date(event.date)) / 86400000);
                    if (daysSinceStart % 14 === 0 && daysSinceStart > 0) {
                        // Already at start of next cycle, continue
                    }
                }
            } else if (event.recurringFrequency === 'monthly') {
                current.setMonth(current.getMonth() + 1);
            }
            
            // Safety limit
            if (current > new Date('2030-12-31')) break;
        }
        
        return instances;
    }
    
    createEvent(date, hour) {
        this.showEventModal(null, date, hour);
    }
    
    editEvent(event) {
        this.showEventModal(event);
    }
    
    showEventModal(event = null, date = null, hour = null) {
        const isEdit = !!event;
        const modalContent = `
            <div class="modal-header">
                <h3 class="modal-title">${isEdit ? 'Edit Event' : 'New Event'}</h3>
                <button class="close-btn" onclick="lifeHub.closeModal()">&times;</button>
            </div>
            <form id="event-form">
                <div class="form-group">
                    <label class="form-label">Title</label>
                    <input type="text" class="form-control" name="title" value="${event?.title || ''}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Date</label>
                    <input type="date" class="form-control" name="date" value="${event?.date || (date ? this.formatDateISO(date) : '')}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Start Time</label>
                    <input type="time" class="form-control" name="startTime" value="${event?.startTime || (hour ? this.padZero(hour) + ':00' : '09:00')}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">End Time</label>
                    <input type="time" class="form-control" name="endTime" value="${event?.endTime || (hour ? this.padZero(hour + 1) + ':00' : '10:00')}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Description</label>
                    <textarea class="form-control" name="description" rows="3">${event?.description || ''}</textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Color</label>
                    <input type="color" class="form-control" name="color" value="${event?.color || '#667eea'}">
                </div>
                <div class="form-group">
                    <label class="checkbox-item">
                        <input type="checkbox" name="recurring" ${event?.recurring ? 'checked' : ''}>
                        Recurring Event
                    </label>
                </div>
                <div class="form-group recurring-options" style="display: ${event?.recurring ? 'block' : 'none'}">
                    <label class="form-label">Frequency</label>
                    <select class="form-control" name="recurringFrequency" id="frequency-select">
                        <option value="daily" ${event?.recurringFrequency === 'daily' ? 'selected' : ''}>Daily</option>
                        <option value="weekly" ${event?.recurringFrequency === 'weekly' ? 'selected' : ''}>Weekly on specific days</option>
                        <option value="biweekly" ${event?.recurringFrequency === 'biweekly' ? 'selected' : ''}>Bi-weekly on specific days</option>
                        <option value="monthly" ${event?.recurringFrequency === 'monthly' ? 'selected' : ''}>Monthly</option>
                    </select>
                </div>
                <div id="customDaysSelector" class="form-group custom-days-options recurring-options" style="display: ${(event?.recurring && (event?.recurringFrequency === 'weekly' || event?.recurringFrequency === 'biweekly')) ? 'block' : 'none'}">
                    <label class="form-label">Select Days</label>
                    <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:8px;margin:16px 0;padding:16px;background:#f9f9f9;border-radius:12px">
                        <label style="text-align:center;cursor:pointer">
                            <input type="checkbox" class="day-checkbox" data-day="0" name="selectedDays" value="0" ${event?.selectedDays?.[0] ? 'checked' : ''} style="display:block;margin:4px auto">
                            <span style="font-size:0.9rem">Sun</span>
                        </label>
                        <label style="text-align:center;cursor:pointer">
                            <input type="checkbox" class="day-checkbox" data-day="1" name="selectedDays" value="1" ${event?.selectedDays?.[1] ? 'checked' : ''} style="display:block;margin:4px auto">
                            <span style="font-size:0.9rem">Mon</span>
                        </label>
                        <label style="text-align:center;cursor:pointer">
                            <input type="checkbox" class="day-checkbox" data-day="2" name="selectedDays" value="2" ${event?.selectedDays?.[2] ? 'checked' : ''} style="display:block;margin:4px auto">
                            <span style="font-size:0.9rem">Tue</span>
                        </label>
                        <label style="text-align:center;cursor:pointer">
                            <input type="checkbox" class="day-checkbox" data-day="3" name="selectedDays" value="3" ${event?.selectedDays?.[3] ? 'checked' : ''} style="display:block;margin:4px auto">
                            <span style="font-size:0.9rem">Wed</span>
                        </label>
                        <label style="text-align:center;cursor:pointer">
                            <input type="checkbox" class="day-checkbox" data-day="4" name="selectedDays" value="4" ${event?.selectedDays?.[4] ? 'checked' : ''} style="display:block;margin:4px auto">
                            <span style="font-size:0.9rem">Thu</span>
                        </label>
                        <label style="text-align:center;cursor:pointer">
                            <input type="checkbox" class="day-checkbox" data-day="5" name="selectedDays" value="5" ${event?.selectedDays?.[5] ? 'checked' : ''} style="display:block;margin:4px auto">
                            <span style="font-size:0.9rem">Fri</span>
                        </label>
                        <label style="text-align:center;cursor:pointer">
                            <input type="checkbox" class="day-checkbox" data-day="6" name="selectedDays" value="6" ${event?.selectedDays?.[6] ? 'checked' : ''} style="display:block;margin:4px auto">
                            <span style="font-size:0.9rem">Sat</span>
                        </label>
                    </div>
                    <div id="daysSummary" style="margin-top:8px;font-size:0.85rem;color:#667eea"></div>
                </div>
                <div class="form-group recurring-options" style="display: ${event?.recurring ? 'block' : 'none'}">
                    <label class="form-label">End Date (optional)</label>
                    <input type="date" class="form-control" name="endRecurring" value="${event?.endRecurring || ''}">
                </div>
                <div style="display: flex; gap: 12px; margin-top: 24px;">
                    <button type="submit" class="btn-primary" style="flex: 1;">${isEdit ? 'Update' : 'Create'} Event</button>
                    ${isEdit ? '<button type="button" class="btn-danger" onclick="lifeHub.deleteEvent(' + event.id + ')">Delete</button>' : ''}
                    <button type="button" class="btn-secondary" onclick="lifeHub.closeModalWithConfirm()">Cancel</button>
                </div>
            </form>
        `;
        
        document.getElementById('modal-content').innerHTML = modalContent;
        document.getElementById('modal-overlay').classList.add('show');
        
        // Setup recurring toggle
        const recurringCheckbox = document.querySelector('input[name="recurring"]');
        const recurringOptions = document.querySelectorAll('.recurring-options');
        const frequencySelect = document.getElementById('frequency-select');
        const customDaysOptions = document.querySelector('.custom-days-options');
        
        const updateRecurringDisplay = () => {
            const isRecurring = recurringCheckbox.checked;
            const needsDaySelection = frequencySelect.value === 'weekly' || frequencySelect.value === 'biweekly';
            
            recurringOptions.forEach(option => {
                option.style.display = isRecurring ? 'block' : 'none';
            });
            
            if (customDaysOptions) {
                customDaysOptions.style.display = (isRecurring && needsDaySelection) ? 'block' : 'none';
            }
        };
        
        recurringCheckbox.addEventListener('change', updateRecurringDisplay);
        frequencySelect.addEventListener('change', updateRecurringDisplay);
        
        // Setup days summary update
        document.querySelectorAll('.day-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.updateDaysSummary());
        });
        
        this.updateDaysSummary();
        
        // Setup form submission
        document.getElementById('event-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEvent(new FormData(e.target), event?.id);
        });
    }
    
    saveEvent(formData, eventId = null) {
        // Process selected days for weekly/biweekly frequency
        const selectedDays = [false, false, false, false, false, false, false]; // Sun-Sat
        const frequency = formData.get('recurringFrequency');
        
        if (frequency === 'weekly' || frequency === 'biweekly') {
            formData.getAll('selectedDays').forEach(day => {
                const dayIndex = parseInt(day);
                selectedDays[dayIndex] = true;
            });
            
            // Validation: At least one day must be selected
            if (!selectedDays.includes(true)) {
                alert('Please select at least one day for recurring event');
                return;
            }
        }
        
        const eventData = {
            id: eventId || Date.now(),
            title: formData.get('title'),
            date: formData.get('date'),
            startTime: formData.get('startTime'),
            endTime: formData.get('endTime'),
            description: formData.get('description'),
            color: formData.get('color'),
            recurring: formData.has('recurring'),
            recurringFrequency: formData.get('recurringFrequency'),
            selectedDays: selectedDays,
            endRecurring: formData.get('endRecurring') || null
        };
        
        if (eventId) {
            const index = this.data.events.findIndex(e => e.id === eventId);
            this.data.events[index] = eventData;
        } else {
            this.data.events.push(eventData);
        }
        
        this.saveData();
        this.closeModal();
        this.renderCalendar();
    }
    
    deleteEvent(eventId) {
        if (confirm('Are you sure you want to delete this event?')) {
            this.data.events = this.data.events.filter(e => e.id !== eventId);
            this.saveData();
            this.closeModal();
            this.renderCalendar();
        }
    }
    
    // TODOS
    renderTodos() {
        const filter = document.querySelector('.filter-tab.active')?.dataset.filter || 'all';
        const todos = this.filterTodos(filter);
        
        const todoList = document.getElementById('todo-list');
        if (!todos.length) {
            todoList.innerHTML = '<div class="todo-item">No tasks found</div>';
            return;
        }
        
        todoList.innerHTML = todos.map(todo => `
            <div class="todo-item ${todo.completed ? 'completed' : ''}">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <input type="checkbox" ${todo.completed ? 'checked' : ''} 
                           onchange="lifeHub.toggleTodo(${todo.id})">
                    <div style="flex: 1;">
                        <div class="todo-title">${todo.title}</div>
                        ${todo.dueDate ? `<div class="todo-due">Due: ${this.formatDate(new Date(todo.dueDate))} ${todo.dueTime || ''}</div>` : ''}
                        ${todo.notes ? `<div class="todo-notes">${todo.notes}</div>` : ''}
                    </div>
                    <div>
                        <span class="tag priority-${todo.priority}">${todo.priority}</span>
                        <button class="btn-secondary btn-sm" onclick="lifeHub.editTodo(${todo.id})">Edit</button>
                        <button class="btn-danger btn-sm" onclick="lifeHub.deleteTodo(${todo.id})">Delete</button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    filterTodos(filter) {
        const now = new Date();
        const today = this.formatDateISO(now);
        
        return this.data.todos.filter(todo => {
            switch (filter) {
                case 'today':
                    return todo.dueDate === today;
                case 'upcoming':
                    return todo.dueDate > today && !todo.completed;
                case 'completed':
                    return todo.completed;
                default:
                    return true;
            }
        }).sort((a, b) => {
            if (a.completed !== b.completed) return a.completed - b.completed;
            if (a.dueDate !== b.dueDate) return (a.dueDate || '9999') > (b.dueDate || '9999') ? 1 : -1;
            return a.createdAt > b.createdAt ? -1 : 1;
        });
    }
    
    showTodoModal(todo = null) {
        const isEdit = !!todo;
        const goals = this.data.goals;
        
        const modalContent = `
            <div class="modal-header">
                <h3 class="modal-title">${isEdit ? 'Edit Task' : 'New Task'}</h3>
                <button class="close-btn" onclick="lifeHub.closeModal()">&times;</button>
            </div>
            <form id="todo-form">
                <div class="form-group">
                    <label class="form-label">Title</label>
                    <input type="text" class="form-control" name="title" value="${todo?.title || ''}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Due Date</label>
                    <input type="date" class="form-control" name="dueDate" value="${todo?.dueDate || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">Due Time</label>
                    <input type="time" class="form-control" name="dueTime" value="${todo?.dueTime || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">Priority</label>
                    <select class="form-control" name="priority">
                        <option value="low" ${todo?.priority === 'low' ? 'selected' : ''}>Low</option>
                        <option value="medium" ${todo?.priority === 'medium' ? 'selected' : ''}>Medium</option>
                        <option value="high" ${todo?.priority === 'high' ? 'selected' : ''}>High</option>
                    </select>
                </div>
                ${goals.length ? `
                <div class="form-group">
                    <label class="form-label">Link to Goal</label>
                    <select class="form-control" name="linkedGoalId">
                        <option value="">No goal</option>
                        ${goals.map(goal => `<option value="${goal.id}" ${todo?.linkedGoalId === goal.id ? 'selected' : ''}>${goal.title}</option>`).join('')}
                    </select>
                </div>` : ''}
                <div class="form-group">
                    <label class="form-label">Notes</label>
                    <textarea class="form-control" name="notes" rows="3">${todo?.notes || ''}</textarea>
                </div>
                <div style="display: flex; gap: 12px; margin-top: 24px;">
                    <button type="submit" class="btn-primary" style="flex: 1;">${isEdit ? 'Update' : 'Create'} Task</button>
                    ${isEdit ? `<button type="button" class="btn-danger" onclick="lifeHub.deleteTodo(${todo.id})">Delete</button>` : ''}
                    <button type="button" class="btn-secondary" onclick="lifeHub.closeModal()">Cancel</button>
                </div>
            </form>
        `;
        
        document.getElementById('modal-content').innerHTML = modalContent;
        document.getElementById('modal-overlay').classList.add('show');
        
        document.getElementById('todo-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTodo(new FormData(e.target), todo?.id);
        });
    }
    
    saveTodo(formData, todoId = null) {
        const todoData = {
            id: todoId || Date.now(),
            title: formData.get('title'),
            dueDate: formData.get('dueDate') || null,
            dueTime: formData.get('dueTime') || null,
            priority: formData.get('priority'),
            linkedGoalId: formData.get('linkedGoalId') || null,
            notes: formData.get('notes'),
            completed: false,
            createdAt: todoId ? this.data.todos.find(t => t.id === todoId)?.createdAt : Date.now()
        };
        
        if (todoId) {
            const index = this.data.todos.findIndex(t => t.id === todoId);
            this.data.todos[index] = { ...this.data.todos[index], ...todoData };
        } else {
            this.data.todos.push(todoData);
        }
        
        this.saveData();
        this.closeModal();
        this.renderTodos();
    }
    
    toggleTodo(todoId) {
        const todo = this.data.todos.find(t => t.id === todoId);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveData();
            this.renderTodos();
        }
    }
    
    editTodo(todoId) {
        const todo = this.data.todos.find(t => t.id === todoId);
        if (todo) this.showTodoModal(todo);
    }
    
    deleteTodo(todoId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.data.todos = this.data.todos.filter(t => t.id !== todoId);
            this.saveData();
            this.renderTodos();
        }
    }
    
    // GOALS with INTERCONNECTIONS
    renderGoals() {
        const filter = document.querySelector('#goals-module .filter-tab.active')?.dataset.filter || 'all';
        const goals = this.filterGoals(filter);
        
        const goalsList = document.getElementById('goals-list');
        
        // Render network visualization first
        this.renderGoalsNetwork();
        
        if (!goals.length) {
            goalsList.innerHTML = '<div class="goal-card">No goals found</div>';
            return;
        }
        
        goalsList.innerHTML = goals.map(goal => {
            const daysUntil = this.getDaysUntilDeadline(goal.deadline);
            const goalType = this.classifyGoal(goal.deadline);
            const progress = this.calculateGoalProgress(goal);
            const connectedGoals = goal.connectedGoals || [];
            
            return `
                <div class="goal-card" data-goal-id="${goal.id}">
                    <div class="goal-header">
                        <div>
                            <div class="goal-title">${goal.title}</div>
                            <div class="goal-meta">
                                <span class="goal-type ${goalType}">${goalType.replace('-', ' ')}</span>
                                <span class="goal-deadline">Due: ${this.formatDate(new Date(goal.deadline))}</span>
                                <span class="goal-countdown">${daysUntil >= 0 ? daysUntil + ' days left' : 'Overdue by ' + Math.abs(daysUntil) + ' days'}</span>
                            </div>
                        </div>
                        <div>
                            <button class="btn-secondary btn-sm" onclick="lifeHub.editGoal(${goal.id})">Edit</button>
                            <button class="btn-danger btn-sm" onclick="lifeHub.deleteGoal(${goal.id})">Delete</button>
                        </div>
                    </div>
                    
                    ${goal.description ? `<div class="goal-description">${goal.description}</div>` : ''}
                    
                    ${connectedGoals.length ? `
                        <div class="connected-goals">
                            <strong>Connected Goals:</strong>
                            ${connectedGoals.map(goalId => {
                                const connectedGoal = this.data.goals.find(g => g.id === goalId);
                                return connectedGoal ? `<span class="tag">${connectedGoal.title}</span>` : '';
                            }).join('')}
                        </div>
                    ` : ''}
                    
                    ${goalType === 'long-term' ? `
                        <div class="progress-section">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${progress}%"></div>
                            </div>
                            <div class="progress-text">${Math.round(progress)}% Complete</div>
                        </div>
                        
                        ${goal.dailyTasks && goal.dailyTasks.length ? `
                            <div class="daily-tasks">
                                <strong>Daily Tasks:</strong>
                                ${goal.dailyTasks.map(task => `
                                    <div class="task-item ${task.completed ? 'completed' : ''}">
                                        <input type="checkbox" ${task.completed ? 'checked' : ''} 
                                               onchange="lifeHub.toggleDailyTask(${goal.id}, ${task.id})">
                                        <span>${task.task}</span>
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                        
                        ${goal.milestones && goal.milestones.length ? `
                            <div class="milestones">
                                <strong>Milestones:</strong>
                                ${goal.milestones.map(milestone => `
                                    <div class="milestone-item ${milestone.completed ? 'completed' : ''}">
                                        <input type="checkbox" ${milestone.completed ? 'checked' : ''} 
                                               onchange="lifeHub.toggleMilestone(${goal.id}, ${milestone.id})">
                                        <span>${milestone.name} (${this.formatDate(new Date(milestone.targetDate))})</span>
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                        
                        ${goal.resources ? `
                            <div class="goal-resources">
                                <strong>Resources:</strong>
                                <div>${goal.resources}</div>
                            </div>
                        ` : ''}
                    ` : ''}
                </div>
            `;
        }).join('');
    }
    
    renderGoalsNetwork() {
        const networkContainer = document.getElementById('goals-list');
        
        // Create network visualization container if it doesn't exist
        let networkDiv = document.getElementById('goals-network-viz');
        if (!networkDiv) {
            networkDiv = document.createElement('div');
            networkDiv.id = 'goals-network-viz';
            networkDiv.className = 'goals-network';
            networkDiv.innerHTML = '<h3>Goals Network</h3><svg class="network-svg" width="100%" height="400"></svg>';
            networkContainer.insertBefore(networkDiv, networkContainer.firstChild);
        }
        
        const svg = networkDiv.querySelector('svg');
        const width = svg.clientWidth || 800;
        const height = 400;
        
        // Clear existing content
        svg.innerHTML = '';
        
        const goals = this.data.goals;
        if (!goals.length) return;
        
        // Create nodes and links
        const nodes = goals.map(goal => ({
            id: goal.id,
            title: goal.title,
            type: this.classifyGoal(goal.deadline),
            x: Math.random() * (width - 100) + 50,
            y: Math.random() * (height - 100) + 50
        }));
        
        const links = [];
        goals.forEach(goal => {
            if (goal.connectedGoals) {
                goal.connectedGoals.forEach(connectedId => {
                    // Avoid duplicate links
                    if (!links.some(link => 
                        (link.source === goal.id && link.target === connectedId) ||
                        (link.source === connectedId && link.target === goal.id)
                    )) {
                        links.push({ source: goal.id, target: connectedId });
                    }
                });
            }
        });
        
        // Draw links
        links.forEach(link => {
            const sourceNode = nodes.find(n => n.id === link.source);
            const targetNode = nodes.find(n => n.id === link.target);
            
            if (sourceNode && targetNode) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', sourceNode.x);
                line.setAttribute('y1', sourceNode.y);
                line.setAttribute('x2', targetNode.x);
                line.setAttribute('y2', targetNode.y);
                line.setAttribute('stroke', '#ccc');
                line.setAttribute('stroke-width', '2');
                svg.appendChild(line);
            }
        });
        
        // Draw nodes
        nodes.forEach(node => {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', node.x);
            circle.setAttribute('cy', node.y);
            circle.setAttribute('r', '20');
            circle.setAttribute('fill', node.type === 'short-term' ? '#3b82f6' : '#7c3aed');
            circle.setAttribute('stroke', '#fff');
            circle.setAttribute('stroke-width', '3');
            circle.style.cursor = 'pointer';
            
            circle.addEventListener('click', () => this.editGoal(node.id));
            
            svg.appendChild(circle);
            
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', node.x);
            text.setAttribute('y', node.y + 35);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('font-size', '12');
            text.setAttribute('font-weight', 'bold');
            text.textContent = node.title.substring(0, 15) + (node.title.length > 15 ? '...' : '');
            
            svg.appendChild(text);
        });
    }
    
    classifyGoal(deadline) {
        const days = this.getDaysUntilDeadline(deadline);
        return days <= 14 ? 'short-term' : 'long-term';
    }
    
    getDaysUntilDeadline(deadline) {
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const diffTime = deadlineDate.getTime() - now.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    
    calculateGoalProgress(goal) {
        if (goal.type === 'short-term') return 0;
        
        let completedTasks = 0;
        let totalTasks = 0;
        
        if (goal.dailyTasks) {
            totalTasks += goal.dailyTasks.length;
            completedTasks += goal.dailyTasks.filter(task => task.completed).length;
        }
        
        if (goal.milestones) {
            totalTasks += goal.milestones.length;
            completedTasks += goal.milestones.filter(milestone => milestone.completed).length;
        }
        
        return totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;
    }
    
    filterGoals(filter) {
        return this.data.goals.filter(goal => {
            const goalType = this.classifyGoal(goal.deadline);
            switch (filter) {
                case 'short':
                    return goalType === 'short-term';
                case 'long':
                    return goalType === 'long-term';
                default:
                    return true;
            }
        }).sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    }
    
    showGoalModal(goal = null) {
        const isEdit = !!goal;
        const allGoals = this.data.goals.filter(g => !goal || g.id !== goal.id);
        
        const modalContent = `
            <div class="modal-header">
                <h3 class="modal-title">${isEdit ? 'Edit Goal' : 'New Goal'}</h3>
                <button class="close-btn" onclick="lifeHub.closeModal()">&times;</button>
            </div>
            <form id="goal-form">
                <div class="form-group">
                    <label class="form-label">Title</label>
                    <input type="text" class="form-control" name="title" value="${goal?.title || ''}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Deadline</label>
                    <input type="date" class="form-control" name="deadline" value="${goal?.deadline || ''}" required>
                </div>
                
                <div id="goal-type-indicator" class="form-group">
                    <div class="goal-type-preview">This will be classified as: <strong id="goal-type-text">-</strong></div>
                </div>
                
                <div id="long-term-fields" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">Description</label>
                        <textarea class="form-control" name="description" rows="3">${goal?.description || ''}</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Daily Tasks</label>
                        <div id="daily-tasks-container">
                            ${goal?.dailyTasks ? goal.dailyTasks.map((task, index) => `
                                <div class="dynamic-item">
                                    <input type="text" class="form-control" name="dailyTask_${index}" value="${task.task}" placeholder="Task description">
                                    <button type="button" onclick="this.parentElement.remove()">Remove</button>
                                </div>
                            `).join('') : ''}
                        </div>
                        <div class="add-item-btn" onclick="lifeHub.addDynamicField('daily-tasks-container', 'dailyTask')">+ Add Daily Task</div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Milestones</label>
                        <div id="milestones-container">
                            ${goal?.milestones ? goal.milestones.map((milestone, index) => `
                                <div class="dynamic-item">
                                    <input type="text" class="form-control" name="milestoneName_${index}" value="${milestone.name}" placeholder="Milestone name">
                                    <input type="date" class="form-control" name="milestoneDate_${index}" value="${milestone.targetDate}">
                                    <button type="button" onclick="this.parentElement.remove()">Remove</button>
                                </div>
                            `).join('') : ''}
                        </div>
                        <div class="add-item-btn" onclick="lifeHub.addDynamicField('milestones-container', 'milestone')">+ Add Milestone</div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Resources Needed</label>
                        <textarea class="form-control" name="resources" rows="3">${goal?.resources || ''}</textarea>
                    </div>
                </div>
                
                ${allGoals.length ? `
                <div class="form-group">
                    <label class="form-label">Connect to Goals</label>
                    <div class="checkbox-group">
                        ${allGoals.map(g => `
                            <label class="checkbox-item">
                                <input type="checkbox" name="connectedGoals" value="${g.id}" 
                                       ${goal?.connectedGoals?.includes(g.id) ? 'checked' : ''}>
                                ${g.title}
                            </label>
                        `).join('')}
                    </div>
                </div>` : ''}
                
                <div style="display: flex; gap: 12px; margin-top: 24px;">
                    <button type="submit" class="btn-primary" style="flex: 1;">${isEdit ? 'Update' : 'Create'} Goal</button>
                    ${isEdit ? `<button type="button" class="btn-danger" onclick="lifeHub.deleteGoal(${goal.id})">Delete</button>` : ''}
                    <button type="button" class="btn-secondary" onclick="lifeHub.closeModal()">Cancel</button>
                </div>
            </form>
        `;
        
        document.getElementById('modal-content').innerHTML = modalContent;
        document.getElementById('modal-overlay').classList.add('show');
        
        // Setup deadline change handler for classification
        const deadlineInput = document.querySelector('input[name="deadline"]');
        const updateGoalType = () => {
            if (deadlineInput.value) {
                const goalType = this.classifyGoal(deadlineInput.value);
                document.getElementById('goal-type-text').textContent = goalType.replace('-', ' ').toUpperCase();
                document.getElementById('long-term-fields').style.display = goalType === 'long-term' ? 'block' : 'none';
            }
        };
        
        deadlineInput.addEventListener('change', updateGoalType);
        updateGoalType(); // Initial call
        
        document.getElementById('goal-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveGoal(new FormData(e.target), goal?.id);
        });
    }
    
    addDynamicField(containerId, fieldType) {
        const container = document.getElementById(containerId);
        const index = container.children.length;
        
        const fieldHtml = fieldType === 'milestone' ? `
            <div class="dynamic-item">
                <input type="text" class="form-control" name="milestoneName_${index}" placeholder="Milestone name">
                <input type="date" class="form-control" name="milestoneDate_${index}">
                <button type="button" onclick="this.parentElement.remove()">Remove</button>
            </div>
        ` : `
            <div class="dynamic-item">
                <input type="text" class="form-control" name="dailyTask_${index}" placeholder="Task description">
                <button type="button" onclick="this.parentElement.remove()">Remove</button>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', fieldHtml);
    }
    
    saveGoal(formData, goalId = null) {
        // Extract dynamic fields
        const dailyTasks = [];
        const milestones = [];
        
        for (const [key, value] of formData.entries()) {
            if (key.startsWith('dailyTask_') && value.trim()) {
                dailyTasks.push({
                    id: Date.now() + Math.random(),
                    task: value,
                    completed: false
                });
            } else if (key.startsWith('milestoneName_') && value.trim()) {
                const index = key.split('_')[1];
                const date = formData.get(`milestoneDate_${index}`);
                milestones.push({
                    id: Date.now() + Math.random(),
                    name: value,
                    targetDate: date,
                    completed: false
                });
            }
        }
        
        const connectedGoals = formData.getAll('connectedGoals').map(id => parseInt(id));
        
        const goalData = {
            id: goalId || Date.now(),
            title: formData.get('title'),
            deadline: formData.get('deadline'),
            type: this.classifyGoal(formData.get('deadline')),
            description: formData.get('description') || '',
            dailyTasks,
            milestones,
            resources: formData.get('resources') || '',
            connectedGoals,
            createdAt: goalId ? this.data.goals.find(g => g.id === goalId)?.createdAt : Date.now()
        };
        
        if (goalId) {
            const index = this.data.goals.findIndex(g => g.id === goalId);
            this.data.goals[index] = goalData;
        } else {
            this.data.goals.push(goalData);
        }
        
        this.saveData();
        this.closeModal();
        this.renderGoals();
    }
    
    toggleDailyTask(goalId, taskId) {
        const goal = this.data.goals.find(g => g.id === goalId);
        if (goal && goal.dailyTasks) {
            const task = goal.dailyTasks.find(t => t.id === taskId);
            if (task) {
                task.completed = !task.completed;
                this.saveData();
                this.renderGoals();
            }
        }
    }
    
    toggleMilestone(goalId, milestoneId) {
        const goal = this.data.goals.find(g => g.id === goalId);
        if (goal && goal.milestones) {
            const milestone = goal.milestones.find(m => m.id === milestoneId);
            if (milestone) {
                milestone.completed = !milestone.completed;
                this.saveData();
                this.renderGoals();
            }
        }
    }
    
    editGoal(goalId) {
        const goal = this.data.goals.find(g => g.id === goalId);
        if (goal) this.showGoalModal(goal);
    }
    
    deleteGoal(goalId) {
        if (confirm('Are you sure you want to delete this goal?')) {
            this.data.goals = this.data.goals.filter(g => g.id !== goalId);
            this.saveData();
            this.closeModal();
            this.renderGoals();
        }
    }
    
    // FINANCE with PER-INCOME TAX RATES
    renderFinance() {
        this.updateFinanceDashboard();
        this.renderIncomeList();
        this.renderExpensesList();
        this.renderAssetsList();
    }
    
    updateAutoSavingsUI(netBalance) {
        // Create or update auto-savings section
        let autoSavingsSection = document.getElementById('auto-savings-section');
        if (!autoSavingsSection) {
            autoSavingsSection = document.createElement('div');
            autoSavingsSection.id = 'auto-savings-section';
            autoSavingsSection.className = 'summary-card';
            autoSavingsSection.innerHTML = `
                <div class="card-label">Auto-Transfer to Savings</div>
                <div id="auto-savings-content"></div>
            `;
            
            // Insert after the charts container
            const chartsContainer = document.querySelector('.charts-container');
            chartsContainer.parentNode.insertBefore(autoSavingsSection, chartsContainer.nextSibling);
        }
        
        const contentDiv = document.getElementById('auto-savings-content');
        
        if (netBalance > 0) {
            const enabled = this.data.autoSavings.enabled;
            const targetAsset = enabled ? this.data.assets.find(a => a.id === this.data.autoSavings.targetAssetId) : null;
            
            contentDiv.innerHTML = `
                <div class="card-value success">💰 Positive Net: $${netBalance.toFixed(2)}</div>
                <div style="margin-top: 8px;">
                    <label class="checkbox-item">
                        <input type="checkbox" id="auto-savings-enabled" ${enabled ? 'checked' : ''}>
                        Auto-transfer to Savings
                    </label>
                </div>
                ${enabled ? `
                    <div id="auto-savings-settings" style="margin-top: 12px;">
                        <div style="margin-bottom: 8px;">
                            <select id="savings-asset-select" class="form-control" style="font-size: 12px; padding: 4px;">
                                <option value="">Select Asset</option>
                                ${this.data.assets.map(asset => `
                                    <option value="${asset.id}" ${asset.id === this.data.autoSavings.targetAssetId ? 'selected' : ''}>
                                        ${asset.name} (${asset.type})
                                    </option>
                                `).join('')}
                            </select>
                            <button id="create-savings-btn" class="btn-secondary" style="font-size: 11px; padding: 2px 8px; margin-left: 4px;">+ Create New</button>
                        </div>
                        <div style="margin-bottom: 8px;">
                            <label style="font-size: 11px;">Annual Appreciation Rate:</label>
                            <input type="number" id="appreciation-rate" value="${this.data.autoSavings.appreciationRate}" min="0" max="100" step="0.1" style="width: 50px; font-size: 11px; padding: 2px;"> %
                        </div>
                        <button id="save-auto-savings" class="btn-primary" style="font-size: 11px; padding: 4px 8px;">Save Settings</button>
                    </div>
                    ${targetAsset ? `
                        <div id="savings-projection" style="margin-top: 12px; padding: 8px; background: var(--color-bg-3); border-radius: 4px;">
                            <strong style="font-size: 11px;">Quick Projection with $${netBalance.toFixed(2)}/month @ ${this.data.autoSavings.appreciationRate}%:</strong><br>
                            <span style="font-size: 10px;">After 1 year: $${this.calculateProjectedSavings(netBalance, 1).toFixed(2)}</span><br>
                            <span style="font-size: 10px;">After 3 years: $${this.calculateProjectedSavings(netBalance, 3).toFixed(2)}</span><br>
                            <span style="font-size: 10px;">After 5 years: $${this.calculateProjectedSavings(netBalance, 5).toFixed(2)}</span><br>
                            <div style="margin-top: 6px; font-size: 10px; color: var(--color-text-secondary);">See full portfolio projection in chart above</div>
                        </div>
                    ` : ''}
                ` : ''}
            `;
            
            this.setupAutoSavingsEventListeners();
        } else {
            contentDiv.innerHTML = '<div class="card-value" style="color: #666; font-size: 14px;">Enable when net is positive</div>';
        }
    }
    
    setupAutoSavingsEventListeners() {
        const enabledCheckbox = document.getElementById('auto-savings-enabled');
        const assetSelect = document.getElementById('savings-asset-select');
        const appreciationInput = document.getElementById('appreciation-rate');
        const saveButton = document.getElementById('save-auto-savings');
        const createSavingsBtn = document.getElementById('create-savings-btn');
        
        if (enabledCheckbox) {
            enabledCheckbox.addEventListener('change', (e) => {
                this.data.autoSavings.enabled = e.target.checked;
                this.saveData();
                this.updateFinanceDashboard();
                this.renderAssetTrajectory(); // Update the chart when enabled/disabled
            });
        }
        
        if (saveButton) {
            saveButton.addEventListener('click', () => {
                if (assetSelect && assetSelect.value) {
                    this.data.autoSavings.targetAssetId = parseInt(assetSelect.value);
                    this.data.autoSavings.appreciationRate = parseFloat(appreciationInput.value) || 4;
                    this.saveData();
                    this.updateFinanceDashboard();
                    this.renderAssetTrajectory(); // Update the chart with new settings
                    this.showNotification('Auto-savings settings updated!');
                } else {
                    alert('Please select a target asset');
                }
            });
        }
        
        if (createSavingsBtn) {
            createSavingsBtn.addEventListener('click', () => {
                this.showCreateSavingsAssetModal();
            });
        }
    }
    
    showCreateSavingsAssetModal() {
        const modalContent = `
            <div class="modal-header">
                <h3 class="modal-title">Create New Savings Asset</h3>
                <button class="close-btn" onclick="lifeHub.closeModal()">&times;</button>
            </div>
            <form id="create-savings-form">
                <div class="form-group">
                    <label class="form-label">Name</label>
                    <input type="text" class="form-control" name="name" value="My Savings" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Type</label>
                    <select class="form-control" name="type" required>
                        <option value="Savings" selected>Savings</option>
                        <option value="Stocks">Stocks</option>
                        <option value="Bonds">Bonds</option>
                        <option value="Real Estate">Real Estate</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Initial Value ($)</label>
                    <input type="number" class="form-control" name="currentValue" value="0" step="0.01" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Annual Appreciation Rate (%)</label>
                    <input type="number" class="form-control" name="appreciation" value="4" step="0.1" required>
                    <small>Default rates: Savings 4%, Stocks 7%, Real Estate 3%</small>
                </div>
                <div style="display: flex; gap: 12px; margin-top: 24px;">
                    <button type="submit" class="btn-primary" style="flex: 1;">Create Asset</button>
                    <button type="button" class="btn-secondary" onclick="lifeHub.closeModal()">Cancel</button>
                </div>
            </form>
        `;
        
        document.getElementById('modal-content').innerHTML = modalContent;
        document.getElementById('modal-overlay').classList.add('show');
        
        document.getElementById('create-savings-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createSavingsAsset(new FormData(e.target));
        });
    }
    
    createSavingsAsset(formData) {
        const assetData = {
            id: Date.now(),
            name: formData.get('name'),
            type: formData.get('type'),
            currentValue: parseFloat(formData.get('currentValue')),
            appreciation: parseFloat(formData.get('appreciation')),
            notes: 'Created for auto-savings',
            transactions: []
        };
        
        this.data.assets.push(assetData);
        this.data.autoSavings.targetAssetId = assetData.id;
        this.data.autoSavings.appreciationRate = assetData.appreciation;
        
        this.saveData();
        this.closeModal();
        this.updateFinanceDashboard();
        this.renderAssetTrajectory(); // Update chart with new asset
        this.showNotification(`Created savings asset: ${assetData.name}`);
    }
    
    calculateProjectedSavings(monthlyNet, years) {
        const months = years * 12;
        const monthlyRate = this.data.autoSavings.appreciationRate / 100 / 12;
        const targetAsset = this.data.assets.find(a => a.id === this.data.autoSavings.targetAssetId);
        const currentValue = targetAsset ? parseFloat(targetAsset.currentValue) : 0;
        
        // Future value of current amount
        const futureCurrentValue = currentValue * Math.pow(1 + monthlyRate, months);
        
        // Future value of annuity (monthly contributions)
        const futureAnnuityValue = monthlyNet * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
        
        return futureCurrentValue + futureAnnuityValue;
    }
    
    showNotification(message) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.innerHTML = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--color-success);
            color: white;
            padding: 12px 16px;
            border-radius: 6px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 10000;
            font-size: 14px;
            max-width: 300px;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
    
    showAutoInvestModal() {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyIncome = this.data.income
            .filter(item => {
                const itemDate = new Date(item.date);
                return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
            })
            .reduce((sum, item) => sum + parseFloat(item.amount), 0);
        
        const monthlyExpenses = this.data.expenses
            .filter(item => {
                const itemDate = new Date(item.date);
                return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
            })
            .reduce((sum, item) => sum + parseFloat(item.amount), 0);
            
        const netBalance = monthlyIncome - monthlyExpenses;
        
        const modalContent = `
            <div class="modal-header">
                <h3 class="modal-title">Auto-Investment Setup</h3>
                <button class="close-btn" onclick="lifeHub.closeModal()">&times;</button>
            </div>
            <form id="auto-invest-form">
                <div class="form-group">
                    <div class="card-label">Monthly Surplus: <strong>$${netBalance.toFixed(2)}</strong></div>
                </div>
                
                <div class="form-group">
                    <label class="checkbox-item">
                        <input type="checkbox" name="enabled" ${this.data.autoInvestment.enabled ? 'checked' : ''}>
                        Automatically invest surplus to asset each month
                    </label>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Target Asset</label>
                    <select class="form-control" name="targetAssetId" required>
                        <option value="">Select Asset</option>
                        ${this.data.assets.map(asset => `
                            <option value="${asset.id}" ${this.data.autoInvestment.targetAssetId === asset.id ? 'selected' : ''}>
                                ${asset.name} (${asset.type}) - $${parseFloat(asset.currentValue).toFixed(2)}
                            </option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Expected ROI (% per year)</label>
                    <input type="number" class="form-control" name="expectedROI" 
                           value="${this.data.autoInvestment.expectedROI}" min="0" max="100" step="0.1">
                </div>
                
                ${this.data.autoInvestment.enabled && this.data.autoInvestment.targetAssetId ? `
                    <div class="form-group">
                        <div class="card-sublabel">
                            <strong>Projection (1 year):</strong><br>
                            Current + Monthly Surplus × 12 + ROI Growth<br>
                            = $${this.calculateProjectedGrowth().toFixed(2)}
                        </div>
                    </div>
                ` : ''}
                
                <div style="display: flex; gap: 12px; margin-top: 24px;">
                    <button type="submit" class="btn-primary" style="flex: 1;">
                        ${this.data.autoInvestment.enabled ? 'Update' : 'Enable'} Auto-Investment
                    </button>
                    <button type="button" class="btn-secondary" onclick="lifeHub.closeModal()">Cancel</button>
                </div>
            </form>
        `;
        
        document.getElementById('modal-content').innerHTML = modalContent;
        document.getElementById('modal-overlay').classList.add('show');
        
        document.getElementById('auto-invest-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveAutoInvestSettings(new FormData(e.target));
        });
    }
    
    calculateProjectedGrowth() {
        if (!this.data.autoInvestment.targetAssetId) return 0;
        
        const asset = this.data.assets.find(a => a.id === this.data.autoInvestment.targetAssetId);
        if (!asset) return 0;
        
        const currentValue = parseFloat(asset.currentValue);
        const monthlyNet = this.getAverageMonthlyIncome() - this.getAverageMonthlyExpenses();
        const annualContributions = monthlyNet * 12;
        const roiGrowth = (currentValue + annualContributions) * (this.data.autoInvestment.expectedROI / 100);
        
        return currentValue + annualContributions + roiGrowth;
    }
    
    saveAutoInvestSettings(formData) {
        this.data.autoInvestment = {
            enabled: formData.has('enabled'),
            targetAssetId: parseInt(formData.get('targetAssetId')) || null,
            expectedROI: parseFloat(formData.get('expectedROI')) || 5
        };
        
        this.saveData();
        this.closeModal();
        this.updateFinanceDashboard();
        
        const message = this.data.autoInvestment.enabled ? 
            'Auto-investment enabled successfully!' : 'Auto-investment disabled.';
        alert(message);
    }
    
    updateFinanceDashboard() {
        const financeData = this.calculateMonthlyFinances();
        const netBalance = financeData.net;
        
        // Update UI
        document.getElementById('total-income').textContent = `$${financeData.income.toFixed(2)}`;
        document.getElementById('total-expenses').textContent = `$${financeData.expenses.toFixed(2)}`;
        document.getElementById('tax-liability').textContent = `$${financeData.tax.toFixed(2)}`;
        document.getElementById('net-balance').textContent = `$${netBalance.toFixed(2)}`;
        document.getElementById('tax-rate').value = this.data.globalTaxRate;
        
        // Update chart colors based on values
        document.getElementById('net-balance').className = `card-value ${netBalance >= 0 ? 'success' : 'warning'}`;
        
        // Process auto-transfer if enabled and net is positive
        if (this.data.autoSavings.enabled && netBalance > 0) {
            this.processAutoTransfer(netBalance);
        }
        
        // Update auto-savings UI
        this.updateAutoSavingsUI(netBalance);
    }
    
    loadFinanceCharts() {
        this.renderIncomeExpenseChart();
        this.renderExpensePieChart();
        this.renderAssetTrajectory();
    }
    
    renderIncomeExpenseChart() {
        const ctx = document.getElementById('income-expense-chart');
        if (!ctx) return;
        
        if (this.charts.incomeExpense) {
            this.charts.incomeExpense.destroy();
        }
        
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        // Get last 6 months data
        const months = [];
        const incomeData = [];
        const expenseData = [];
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date(currentYear, currentMonth - i, 1);
            const monthName = date.toLocaleString('default', { month: 'short' });
            months.push(monthName);
            
            const monthIncome = this.data.income
                .filter(item => {
                    const itemDate = new Date(item.date);
                    return itemDate.getMonth() === date.getMonth() && itemDate.getFullYear() === date.getFullYear();
                })
                .reduce((sum, item) => sum + parseFloat(item.amount), 0);
            
            const monthExpenses = this.data.expenses
                .filter(item => {
                    const itemDate = new Date(item.date);
                    return itemDate.getMonth() === date.getMonth() && itemDate.getFullYear() === date.getFullYear();
                })
                .reduce((sum, item) => sum + parseFloat(item.amount), 0);
            
            incomeData.push(monthIncome);
            expenseData.push(monthExpenses);
        }
        
        this.charts.incomeExpense = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [{
                    label: 'Income',
                    data: incomeData,
                    backgroundColor: '#1FB8CD',
                    borderRadius: 4
                }, {
                    label: 'Expenses',
                    data: expenseData,
                    backgroundColor: '#FFC185',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }
    
    renderExpensePieChart() {
        const ctx = document.getElementById('expense-pie-chart');
        if (!ctx) return;
        
        if (this.charts.expensePie) {
            this.charts.expensePie.destroy();
        }
        
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        // Group expenses by category
        const categoryTotals = {};
        this.data.expenses
            .filter(item => {
                const itemDate = new Date(item.date);
                return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
            })
            .forEach(expense => {
                const category = expense.category || 'Other';
                categoryTotals[category] = (categoryTotals[category] || 0) + parseFloat(expense.amount);
            });
        
        const labels = Object.keys(categoryTotals);
        const data = Object.values(categoryTotals);
        const colors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325', '#944454', '#13343B'];
        
        this.charts.expensePie = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors.slice(0, labels.length)
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': $' + context.raw.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }
    
    renderAssetTrajectory() {
        const ctx = document.getElementById('asset-trajectory-chart');
        if (!ctx) return;
        
        if (this.charts.trajectory) {
            this.charts.trajectory.destroy();
        }
        
        const timeframe = parseInt(document.getElementById('trajectory-timeframe').value) || 1;
        const result = this.projectAssetPortfolio(timeframe);
        
        if (!result || !result.projections || !result.projections.length) {
            ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
            return;
        }
        
        const { projections, assetData, monthlyNet } = result;
        
        const datasets = [];
        
        // Total portfolio (bold line)
        datasets.push({
            label: 'Total Portfolio',
            data: projections.map(p => p.total),
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            borderWidth: 3,
            tension: 0.3,
            fill: true
        });
        
        // Individual assets (dashed lines)
        const colors = ['#28a745', '#ff9500', '#3498db', '#e74c3c', '#9b59b6'];
        let colorIdx = 0;
        
        Object.keys(assetData).forEach(assetId => {
            const asset = assetData[assetId];
            datasets.push({
                label: asset.name,
                data: asset.monthlyValues.slice(1), // Skip initial value
                borderColor: colors[colorIdx % colors.length],
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderDash: [5, 5],
                tension: 0.3,
                fill: false
            });
            colorIdx++;
        });
        
        this.charts.trajectory = new Chart(ctx, {
            type: 'line',
            data: {
                labels: projections.map(p => p.label),
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Asset Portfolio Growth - ' + timeframe + ' Year' + (timeframe > 1 ? 's' : ''),
                        font: { size: 16, weight: 'bold' }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': $' + 
                                       context.parsed.y.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                if (value >= 1000000) {
                                    return '$' + (value / 1000000).toFixed(1) + 'M';
                                } else if (value >= 1000) {
                                    return '$' + (value / 1000).toFixed(0) + 'K';
                                }
                                return '$' + value.toFixed(0);
                            }
                        }
                    }
                }
            }
        });
        
        // Render projection cards and summary
        this.renderAssetProjectionCards(timeframe, result);
        this.renderPortfolioSummary(timeframe, result);
    }
    
    getAverageMonthlyIncome() {
        if (!this.data.income.length) return 0;
        const total = this.data.income.reduce((sum, item) => sum + parseFloat(item.amount), 0);
        const months = this.getMonthsSpan(this.data.income);
        return months > 0 ? total / months : total;
    }
    
    getAverageMonthlyExpenses() {
        if (!this.data.expenses.length) return 0;
        const total = this.data.expenses.reduce((sum, item) => sum + parseFloat(item.amount), 0);
        const months = this.getMonthsSpan(this.data.expenses);
        return months > 0 ? total / months : total;
    }
    
    getMonthsSpan(items) {
        if (!items.length) return 1;
        const dates = items.map(item => new Date(item.date));
        const earliest = new Date(Math.min(...dates));
        const latest = new Date(Math.max(...dates));
        const diffMonths = (latest.getFullYear() - earliest.getFullYear()) * 12 + (latest.getMonth() - earliest.getMonth()) + 1;
        return Math.max(1, diffMonths);
    }
    
    renderIncomeList() {
        const incomeList = document.getElementById('income-list');
        if (!this.data.income.length) {
            incomeList.innerHTML = '<div class="income-item">No income entries found</div>';
            return;
        }
        
        incomeList.innerHTML = this.data.income
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(income => `
                <div class="income-item">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div class="item-title">
                                ${income.recurring ? '🔄 ' : ''}$${parseFloat(income.amount).toFixed(2)} - ${income.category}
                            </div>
                            <div class="item-meta">
                                ${this.formatDate(new Date(income.date))} • Tax: ${income.taxRate || 0}%
                                ${income.recurring ? ` • ${this.getFrequencyDisplay(income.recurringFrequency, income.selectedDays)}` : ''}
                            </div>
                            ${income.notes ? `<div class="item-notes">${income.notes}</div>` : ''}
                        </div>
                        <div>
                            <button class="btn-secondary btn-sm" onclick="lifeHub.editIncome(${income.id})">Edit</button>
                            <button class="btn-danger btn-sm" onclick="lifeHub.deleteIncome(${income.id})">Delete</button>
                        </div>
                    </div>
                </div>
            `).join('');
    }
    
    renderExpensesList() {
        const expensesList = document.getElementById('expenses-list');
        if (!this.data.expenses.length) {
            expensesList.innerHTML = '<div class="expense-item">No expenses found</div>';
            return;
        }
        
        expensesList.innerHTML = this.data.expenses
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(expense => `
                <div class="expense-item">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div class="item-title">
                                ${expense.recurring ? '🔄 ' : ''}$${parseFloat(expense.amount).toFixed(2)} - ${expense.category}
                                ${expense.taxDeductible ? ' 💰' : ''}
                            </div>
                            <div class="item-meta">
                                ${this.formatDate(new Date(expense.date))}
                                ${expense.recurring ? ` • ${this.getFrequencyDisplay(expense.recurringFrequency, expense.selectedDays)}` : ''}
                            </div>
                            ${expense.notes ? `<div class="item-notes">${expense.notes}</div>` : ''}
                        </div>
                        <div>
                            <button class="btn-secondary btn-sm" onclick="lifeHub.editExpense(${expense.id})">Edit</button>
                            <button class="btn-danger btn-sm" onclick="lifeHub.deleteExpense(${expense.id})">Delete</button>
                        </div>
                    </div>
                </div>
            `).join('');
    }
    
    renderAssetsList() {
        const assetsList = document.getElementById('assets-list');
        if (!this.data.assets.length) {
            assetsList.innerHTML = '<div class="asset-item">No assets found</div>';
            return;
        }
        
        assetsList.innerHTML = this.data.assets.map(asset => {
            const isAutoSavingsTarget = this.data.autoSavings.targetAssetId === asset.id;
            const monthlyNet = (asset.monthlyIncome || 0) - (asset.monthlyPayment || 0);
            
            return `
                <div class="asset-item">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="flex: 1;">
                            <div class="item-title">
                                ${asset.name} (${asset.type})
                                ${isAutoSavingsTarget ? ' 💰' : ''}
                            </div>
                            <div class="item-meta">Value: $${parseFloat(asset.currentValue).toFixed(2)} • Growth: ${asset.appreciation || 0}%/year</div>
                            
                            ${monthlyNet !== 0 ? `
                                <div style="margin-top:8px;padding:8px;background:#f9f9f9;border-radius:6px;font-size:12px">
                                    <div style="color:#888">Monthly Cash Flow</div>
                                    ${asset.monthlyIncome ? `<div style="color:#28a745">+$${asset.monthlyIncome}/mo income</div>` : ''}
                                    ${asset.monthlyPayment ? `<div style="color:#ff3b30">-$${asset.monthlyPayment}/mo payment</div>` : ''}
                                    <div style="font-weight:600;color:${monthlyNet > 0 ? '#28a745' : '#ff3b30'}">
                                        Net: ${monthlyNet > 0 ? '+' : ''}$${monthlyNet.toFixed(2)}/mo
                                    </div>
                                </div>
                            ` : ''}
                            
                            ${asset.transactions && asset.transactions.length ? `
                                <div class="asset-transactions" style="margin-top: 8px;">
                                    <strong>Recent Transactions:</strong>
                                    ${asset.transactions.slice(-3).map(tx => `
                                        <div style="font-size: 11px; color: #666;">
                                            ${this.formatDate(new Date(tx.date))}: $${Math.abs(tx.amount).toFixed(2)} (${tx.type})
                                            ${tx.note ? `- ${tx.note}` : ''}
                                        </div>
                                    `).join('')}
                                    ${asset.transactions.length > 3 ? `<div style="font-size: 10px; color: #999;">... and ${asset.transactions.length - 3} more</div>` : ''}
                                </div>
                            ` : ''}
                            ${asset.notes ? `<div class="item-notes">${asset.notes}</div>` : ''}
                        </div>
                        <div>
                            <button class="btn-secondary btn-sm" onclick="lifeHub.editAsset(${asset.id})">Edit</button>
                            <button class="btn-danger btn-sm" onclick="lifeHub.deleteAsset(${asset.id})">Delete</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    showIncomeModal(income = null) {
        const isEdit = !!income;
        const modalContent = `
            <div class="modal-header">
                <h3 class="modal-title">${isEdit ? 'Edit Income' : 'New Income'}</h3>
                <button class="close-btn" onclick="lifeHub.closeModal()">&times;</button>
            </div>
            <form id="income-form">
                <div class="form-group">
                    <label class="form-label">Amount ($)</label>
                    <input type="number" class="form-control" name="amount" value="${income?.amount || ''}" step="0.01" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Category</label>
                    <input type="text" class="form-control" name="category" value="${income?.category || ''}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Tax Rate (%)</label>
                    <input type="number" class="form-control" name="taxRate" value="${income?.taxRate || 0}" min="0" max="100" step="0.1">
                </div>
                <div class="form-group">
                    <label class="form-label">Date</label>
                    <input type="date" class="form-control" name="date" value="${income?.date || this.formatDateISO(new Date())}" required>
                </div>
                
                <div class="form-group">
                    <label class="checkbox-item">
                        <input type="checkbox" name="recurring" ${income?.recurring ? 'checked' : ''}>
                        Recurring Income
                    </label>
                </div>
                <div class="form-group recurring-options" style="display: ${income?.recurring ? 'block' : 'none'}">
                    <label class="form-label">Frequency</label>
                    <select class="form-control" name="recurringFrequency" id="income-frequency-select">
                        <option value="daily" ${income?.recurringFrequency === 'daily' ? 'selected' : ''}>Daily</option>
                        <option value="weekly" ${income?.recurringFrequency === 'weekly' ? 'selected' : ''}>Weekly</option>
                        <option value="biweekly" ${income?.recurringFrequency === 'biweekly' ? 'selected' : ''}>Bi-weekly</option>
                        <option value="monthly" ${income?.recurringFrequency === 'monthly' ? 'selected' : ''}>Monthly</option>
                        <option value="yearly" ${income?.recurringFrequency === 'yearly' ? 'selected' : ''}>Yearly</option>

                    </select>
                </div>

                <div class="form-group recurring-options" style="display: ${income?.recurring ? 'block' : 'none'}">
                    <label class="form-label">End Date (optional)</label>
                    <input type="date" class="form-control" name="endRecurring" value="${income?.endRecurring || ''}">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Notes</label>
                    <textarea class="form-control" name="notes" rows="2">${income?.notes || ''}</textarea>
                </div>
                <div style="display: flex; gap: 12px; margin-top: 24px;">
                    <button type="submit" class="btn-primary" style="flex: 1;">${isEdit ? 'Update' : 'Add'} Income</button>
                    ${isEdit ? `<button type="button" class="btn-danger" onclick="lifeHub.deleteIncome(${income.id})">Delete</button>` : ''}
                    <button type="button" class="btn-secondary" onclick="lifeHub.closeModal()">Cancel</button>
                </div>
            </form>
        `;
        
        document.getElementById('modal-content').innerHTML = modalContent;
        document.getElementById('modal-overlay').classList.add('show');
        
        // Setup recurring toggle for income
        const incomeRecurringCheckbox = document.querySelector('input[name="recurring"]');
        const incomeRecurringOptions = document.querySelectorAll('.recurring-options');
        
        const updateIncomeRecurringDisplay = () => {
            const isRecurring = incomeRecurringCheckbox.checked;
            
            incomeRecurringOptions.forEach(option => {
                option.style.display = isRecurring ? 'block' : 'none';
            });
        };
        
        incomeRecurringCheckbox.addEventListener('change', updateIncomeRecurringDisplay);
        
        document.getElementById('income-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveIncome(new FormData(e.target), income?.id);
        });
    }
    
    saveIncome(formData, incomeId = null) {
        // Income doesn't need custom days - simplified
        const selectedDays = [false, false, false, false, false, false, false];
        
        const incomeData = {
            id: incomeId || Date.now(),
            amount: parseFloat(formData.get('amount')),
            category: formData.get('category'),
            taxRate: parseFloat(formData.get('taxRate')),
            date: formData.get('date'),
            recurring: formData.has('recurring'),
            recurringFrequency: formData.get('recurringFrequency'),
            selectedDays: selectedDays,
            endRecurring: formData.get('endRecurring') || null,
            notes: formData.get('notes')
        };
        
        if (incomeId) {
            const index = this.data.income.findIndex(i => i.id === incomeId);
            this.data.income[index] = incomeData;
        } else {
            this.data.income.push(incomeData);
        }
        
        this.saveData();
        this.closeModal();
        this.renderFinance();
        if (this.currentModule === 'finance') {
            this.renderAssetTrajectory(); // Update trajectory when income changes
        }
    }
    
    showExpenseModal(expense = null) {
        const isEdit = !!expense;
        const categories = ['Food', 'Transportation', 'Housing', 'Utilities', 'Entertainment', 'Shopping', 'Healthcare', 'Education', 'Other'];
        
        const modalContent = `
            <div class="modal-header">
                <h3 class="modal-title">${isEdit ? 'Edit Expense' : 'New Expense'}</h3>
                <button class="close-btn" onclick="lifeHub.closeModal()">&times;</button>
            </div>
            <form id="expense-form">
                <div class="form-group">
                    <label class="form-label">Amount ($)</label>
                    <input type="number" class="form-control" name="amount" value="${expense?.amount || ''}" step="0.01" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Category</label>
                    <select class="form-control" name="category" required>
                        ${categories.map(cat => `<option value="${cat}" ${expense?.category === cat ? 'selected' : ''}>${cat}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="checkbox-item">
                        <input type="checkbox" name="taxDeductible" ${expense?.taxDeductible ? 'checked' : ''}>
                        Tax Deductible
                    </label>
                </div>
                <div class="form-group">
                    <label class="form-label">Date</label>
                    <input type="date" class="form-control" name="date" value="${expense?.date || this.formatDateISO(new Date())}" required>
                </div>
                
                <div class="form-group">
                    <label class="checkbox-item">
                        <input type="checkbox" name="recurring" ${expense?.recurring ? 'checked' : ''}>
                        Recurring Expense
                    </label>
                </div>
                <div class="form-group recurring-options" style="display: ${expense?.recurring ? 'block' : 'none'}">
                    <label class="form-label">Frequency</label>
                    <select class="form-control" name="recurringFrequency" id="expense-frequency-select">
                        <option value="daily" ${expense?.recurringFrequency === 'daily' ? 'selected' : ''}>Daily</option>
                        <option value="weekly" ${expense?.recurringFrequency === 'weekly' ? 'selected' : ''}>Weekly</option>
                        <option value="biweekly" ${expense?.recurringFrequency === 'biweekly' ? 'selected' : ''}>Bi-weekly</option>
                        <option value="monthly" ${expense?.recurringFrequency === 'monthly' ? 'selected' : ''}>Monthly</option>
                        <option value="yearly" ${expense?.recurringFrequency === 'yearly' ? 'selected' : ''}>Yearly</option>

                    </select>
                </div>

                <div class="form-group recurring-options" style="display: ${expense?.recurring ? 'block' : 'none'}">
                    <label class="form-label">End Date (optional)</label>
                    <input type="date" class="form-control" name="endRecurring" value="${expense?.endRecurring || ''}">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Notes</label>
                    <textarea class="form-control" name="notes" rows="2">${expense?.notes || ''}</textarea>
                </div>
                <div style="display: flex; gap: 12px; margin-top: 24px;">
                    <button type="submit" class="btn-primary" style="flex: 1;">${isEdit ? 'Update' : 'Add'} Expense</button>
                    ${isEdit ? `<button type="button" class="btn-danger" onclick="lifeHub.deleteExpense(${expense.id})">Delete</button>` : ''}
                    <button type="button" class="btn-secondary" onclick="lifeHub.closeModal()">Cancel</button>
                </div>
            </form>
        `;
        
        document.getElementById('modal-content').innerHTML = modalContent;
        document.getElementById('modal-overlay').classList.add('show');
        
        // Setup recurring toggle for expense
        const expenseRecurringCheckbox = document.querySelector('input[name="recurring"]');
        const expenseRecurringOptions = document.querySelectorAll('.recurring-options');
        
        const updateExpenseRecurringDisplay = () => {
            const isRecurring = expenseRecurringCheckbox.checked;
            
            expenseRecurringOptions.forEach(option => {
                option.style.display = isRecurring ? 'block' : 'none';
            });
        };
        
        expenseRecurringCheckbox.addEventListener('change', updateExpenseRecurringDisplay);
        
        document.getElementById('expense-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveExpense(new FormData(e.target), expense?.id);
        });
    }
    
    saveExpense(formData, expenseId = null) {
        // Expenses doesn't need custom days - simplified  
        const selectedDays = [false, false, false, false, false, false, false];
        
        const expenseData = {
            id: expenseId || Date.now(),
            amount: parseFloat(formData.get('amount')),
            category: formData.get('category'),
            taxDeductible: formData.has('taxDeductible'),
            date: formData.get('date'),
            recurring: formData.has('recurring'),
            recurringFrequency: formData.get('recurringFrequency'),
            selectedDays: selectedDays,
            endRecurring: formData.get('endRecurring') || null,
            notes: formData.get('notes')
        };
        
        if (expenseId) {
            const index = this.data.expenses.findIndex(e => e.id === expenseId);
            this.data.expenses[index] = expenseData;
        } else {
            this.data.expenses.push(expenseData);
        }
        
        this.saveData();
        this.closeModal();
        this.renderFinance();
        if (this.currentModule === 'finance') {
            this.renderAssetTrajectory(); // Update trajectory when expenses change
        }
    }
    
    showAssetModal(asset = null) {
        const isEdit = !!asset;
        const assetTypes = ['Cash', 'Savings', 'Stocks', 'Bonds', 'Real Estate', 'Crypto', 'Other'];
        const savingsAssets = this.data.assets.filter(a => a.type === 'Savings' || a.type === 'Cash');
        
        const modalContent = `
            <div class="modal-header">
                <h3 class="modal-title">${isEdit ? 'Edit Asset' : 'New Asset'}</h3>
                <button class="close-btn" onclick="lifeHub.closeModal()">&times;</button>
            </div>
            <form id="asset-form">
                <div class="form-group">
                    <label class="form-label">Name *</label>
                    <input type="text" class="form-control" name="name" value="${asset?.name || ''}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Type *</label>
                    <select class="form-control" name="type" required>
                        ${assetTypes.map(type => `<option value="${type}" ${asset?.type === type ? 'selected' : ''}>${type}</option>`).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Purchase Value * ($)</label>
                    <input type="number" class="form-control" name="currentValue" value="${asset?.currentValue || ''}" step="0.01" required>
                </div>
                
                ${!isEdit && savingsAssets.length ? `
                <div class="form-group">
                    <label class="checkbox-item">
                        <input type="checkbox" id="fromSavings">
                        ☐ Purchased with savings
                    </label>
                </div>
                
                <div id="savingsWithdrawal" style="display:none">
                    <div class="form-group">
                        <label class="form-label">Withdraw from:</label>
                        <select class="form-control" id="sourceAsset">
                            <option value="">Select Asset</option>
                            ${savingsAssets.map(asset => `
                                <option value="${asset.id}">
                                    ${asset.name} (${asset.type}) - $${parseFloat(asset.currentValue).toFixed(2)}
                                </option>
                            `).join('')}
                        </select>
                        <div id="withdrawal-warning" style="color:#ff9500;margin:8px 0;font-size:12px"></div>
                    </div>
                </div>
                ` : ''}
                
                <div class="form-group">
                    <label class="form-label">Annual Appreciation Rate (%)</label>
                    <input type="number" class="form-control" name="appreciation" value="${asset?.appreciation || 0}" step="0.1">
                    <small style="color: #666; font-size: 12px;">e.g., 4% for savings, 7% for stocks, 3% for real estate</small>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Monthly Loan Payment (if applicable) ($)</label>
                    <input type="number" class="form-control" name="monthlyPayment" value="${asset?.monthlyPayment || 0}" step="0.01">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Monthly Interest/Dividend Income ($)</label>
                    <input type="number" class="form-control" name="monthlyIncome" value="${asset?.monthlyIncome || 0}" step="0.01">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Notes</label>
                    <textarea class="form-control" name="notes" rows="2">${asset?.notes || ''}</textarea>
                </div>
                
                <div style="display: flex; gap: 12px; margin-top: 24px;">
                    <button type="submit" class="btn-primary" style="flex: 1;">${isEdit ? 'Update' : 'Add'} Asset</button>
                    ${isEdit ? `<button type="button" class="btn-danger" onclick="lifeHub.deleteAsset(${asset.id})">Delete</button>` : ''}
                    <button type="button" class="btn-secondary" onclick="lifeHub.closeModal()">Cancel</button>
                </div>
            </form>
        `;
        
        document.getElementById('modal-content').innerHTML = modalContent;
        document.getElementById('modal-overlay').classList.add('show');
        
        // Setup withdrawal from savings functionality
        const fromSavingsCheckbox = document.getElementById('fromSavings');
        const savingsWithdrawalDiv = document.getElementById('savingsWithdrawal');
        const sourceAssetSelect = document.getElementById('sourceAsset');
        const warningDiv = document.getElementById('withdrawal-warning');
        const valueInput = document.querySelector('input[name="currentValue"]');
        
        if (fromSavingsCheckbox) {
            fromSavingsCheckbox.addEventListener('change', function() {
                savingsWithdrawalDiv.style.display = this.checked ? 'block' : 'none';
                updateWarning();
            });
        }
        
        const updateWarning = () => {
            if (!fromSavingsCheckbox?.checked || !sourceAssetSelect?.value || !valueInput?.value) {
                if (warningDiv) warningDiv.textContent = '';
                return;
            }
            
            const sourceAsset = savingsAssets.find(a => a.id == sourceAssetSelect.value);
            const withdrawAmount = parseFloat(valueInput.value);
            
            if (sourceAsset && withdrawAmount > 0) {
                if (withdrawAmount > sourceAsset.currentValue) {
                    warningDiv.textContent = `⚠️ Insufficient funds! ${sourceAsset.name} only has $${sourceAsset.currentValue.toFixed(2)}`;
                    warningDiv.style.color = '#ff3b30';
                } else {
                    warningDiv.textContent = `⚠️ This will reduce ${sourceAsset.name} by $${withdrawAmount.toFixed(2)}`;
                    warningDiv.style.color = '#ff9500';
                }
            }
        };
        
        if (sourceAssetSelect) sourceAssetSelect.addEventListener('change', updateWarning);
        if (valueInput) valueInput.addEventListener('input', updateWarning);
        
        document.getElementById('asset-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveAsset(new FormData(e.target), asset?.id);
        });
    }
    
    saveAsset(formData, assetId = null) {
        const assetData = {
            id: assetId || Date.now(),
            name: formData.get('name'),
            type: formData.get('type'),
            currentValue: parseFloat(formData.get('currentValue')),
            appreciation: parseFloat(formData.get('appreciation')) || 0,
            monthlyPayment: parseFloat(formData.get('monthlyPayment')) || 0,
            monthlyIncome: parseFloat(formData.get('monthlyIncome')) || 0,
            notes: formData.get('notes'),
            purchaseDate: assetId ? this.data.assets.find(a => a.id === assetId)?.purchaseDate : this.formatDateISO(new Date()),
            transactions: []
        };
        
        // Track withdrawal from savings if applicable
        const fromSavingsCheckbox = document.getElementById('fromSavings');
        if (fromSavingsCheckbox && fromSavingsCheckbox.checked) {
            const sourceAssetId = parseInt(document.getElementById('sourceAsset').value);
            const sourceAsset = this.data.assets.find(a => a.id === sourceAssetId);
            
            if (sourceAsset) {
                // Validate sufficient funds
                if (assetData.currentValue > sourceAsset.currentValue) {
                    alert(`Insufficient funds! ${sourceAsset.name} only has $${sourceAsset.currentValue.toFixed(2)}`);
                    return;
                }
                
                // Deduct from source asset
                sourceAsset.currentValue -= assetData.currentValue;
                
                // Log transaction in source
                if (!sourceAsset.transactions) sourceAsset.transactions = [];
                sourceAsset.transactions.push({
                    date: this.formatDateISO(new Date()),
                    amount: -assetData.currentValue,
                    type: 'withdrawal',
                    note: 'Purchase: ' + assetData.name
                });
                
                // Log transaction in new asset
                assetData.transactions.push({
                    date: this.formatDateISO(new Date()),
                    amount: assetData.currentValue,
                    type: 'purchase',
                    note: 'Purchased from: ' + sourceAsset.name
                });
            }
        }
        
        if (assetId) {
            const index = this.data.assets.findIndex(a => a.id === assetId);
            const existingAsset = this.data.assets[index];
            this.data.assets[index] = { ...existingAsset, ...assetData, transactions: existingAsset.transactions || [] };
        } else {
            this.data.assets.push(assetData);
        }
        
        this.saveData();
        this.closeModal();
        this.renderFinance();
        if (this.currentModule === 'finance') {
            this.renderAssetTrajectory(); // Update trajectory when assets change
        }
    }
    
    editIncome(incomeId) {
        const income = this.data.income.find(i => i.id === incomeId);
        if (income) this.showIncomeModal(income);
    }
    
    deleteIncome(incomeId) {
        if (confirm('Are you sure you want to delete this income entry?')) {
            this.data.income = this.data.income.filter(i => i.id !== incomeId);
            this.saveData();
            this.closeModal();
            this.renderFinance();
        }
    }
    
    editExpense(expenseId) {
        const expense = this.data.expenses.find(e => e.id === expenseId);
        if (expense) this.showExpenseModal(expense);
    }
    
    deleteExpense(expenseId) {
        if (confirm('Are you sure you want to delete this expense?')) {
            this.data.expenses = this.data.expenses.filter(e => e.id !== expenseId);
            this.saveData();
            this.closeModal();
            this.renderFinance();
        }
    }
    
    editAsset(assetId) {
        const asset = this.data.assets.find(a => a.id === assetId);
        if (asset) this.showAssetModal(asset);
    }
    
    deleteAsset(assetId) {
        if (confirm('Are you sure you want to delete this asset?')) {
            this.data.assets = this.data.assets.filter(a => a.id !== assetId);
            this.saveData();
            this.closeModal();
            this.renderFinance();
        }
    }
    
    // HEALTH with COFFEE & COKE TRACKING
    renderHealthDashboard() {
        const timeframe = document.getElementById('health-timeframe').value;
        const healthData = this.getHealthDataByTimeframe(timeframe);
        
        const dashboard = document.getElementById('health-dashboard');
        
        if (!healthData.length) {
            dashboard.innerHTML = `
                <div class="health-card">
                    <h3>No health data found</h3>
                    <p>Start logging your daily health metrics to see insights here.</p>
                </div>
            `;
            return;
        }
        
        // Calculate averages
        const avgSleep = healthData.reduce((sum, log) => sum + (parseFloat(log.sleep) || 0), 0) / healthData.length;
        const avgExercise = healthData.reduce((sum, log) => sum + (parseFloat(log.exerciseDuration) || 0), 0) / healthData.length;
        const avgWater = healthData.reduce((sum, log) => sum + (parseFloat(log.water) || 0), 0) / healthData.length;
        const avgCoffee = healthData.reduce((sum, log) => sum + (parseFloat(log.coffee) || 0), 0) / healthData.length;
        const avgCoke = healthData.reduce((sum, log) => sum + (parseFloat(log.coke) || 0), 0) / healthData.length;
        
        // Mood distribution
        const moodCounts = {};
        healthData.forEach(log => {
            const mood = log.mood || 'Unknown';
            moodCounts[mood] = (moodCounts[mood] || 0) + 1;
        });
        
        dashboard.innerHTML = `
            <div class="health-stats">
                <div class="stat-card">
                    <div class="stat-value">${avgSleep.toFixed(1)}h</div>
                    <div class="stat-label">Avg Sleep</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${avgExercise.toFixed(0)}min</div>
                    <div class="stat-label">Avg Exercise</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${avgWater.toFixed(1)}</div>
                    <div class="stat-label">Avg Water (glasses)</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${avgCoffee.toFixed(1)}</div>
                    <div class="stat-label">Avg Coffee (cups)</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${avgCoke.toFixed(1)}</div>
                    <div class="stat-label">Avg Coke (cans)</div>
                </div>
            </div>
            
            <div class="health-charts">
                <div class="chart-card">
                    <h3>Health Trends</h3>
                    <canvas id="health-trends-chart" style="height: 300px;"></canvas>
                </div>
                <div class="chart-card">
                    <h3>Mood Distribution</h3>
                    <canvas id="mood-pie-chart" style="height: 300px;"></canvas>
                </div>
                <div class="chart-card">
                    <h3>Exercise vs Mood</h3>
                    <canvas id="exercise-mood-chart" style="height: 300px;"></canvas>
                </div>
                <div class="chart-card">
                    <h3>Sleep vs Mood</h3>
                    <canvas id="sleep-mood-chart" style="height: 300px;"></canvas>
                </div>
            </div>
        `;
        
        // CRITICAL: Destroy old charts first, then render new ones
        this.destroyHealthCharts();
        
        // Render charts with proper delay
        setTimeout(() => {
            this.renderHealthTrendsChart(healthData);
            this.renderMoodPieChart(moodCounts);
            this.renderExerciseMoodChart(healthData);
            this.renderSleepMoodChart(healthData);
        }, 100);
    }
    
    destroyHealthCharts() {
        // Destroy all existing health charts
        Object.keys(this.healthCharts).forEach(key => {
            if (this.healthCharts[key]) {
                this.healthCharts[key].destroy();
                this.healthCharts[key] = null;
            }
        });
    }
    
    getHealthDataByTimeframe(timeframe) {
        const now = new Date();
        return this.data.health.filter(log => {
            const logDate = new Date(log.date);
            switch (timeframe) {
                case 'month':
                    return logDate >= new Date(now.getFullYear(), now.getMonth(), 1);
                case 'year':
                    return logDate >= new Date(now.getFullYear(), 0, 1);
                default:
                    return true;
            }
        }).sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    
    renderHealthTrendsChart(healthData) {
        const ctx = document.getElementById('health-trends-chart');
        if (!ctx) return;
        
        // DESTROY OLD CHART FIRST
        if (this.healthCharts.trends) {
            this.healthCharts.trends.destroy();
            this.healthCharts.trends = null;
        }
        
        const labels = healthData.map(log => this.formatDate(new Date(log.date)));
        
        this.healthCharts.trends = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Sleep (hours)',
                        data: healthData.map(log => parseFloat(log.sleep) || 0),
                        borderColor: '#1FB8CD',
                        backgroundColor: 'rgba(31, 184, 205, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Exercise (min/10)',
                        data: healthData.map(log => (parseFloat(log.exerciseDuration) || 0) / 10),
                        borderColor: '#FFC185',
                        backgroundColor: 'rgba(255, 193, 133, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Water (glasses)',
                        data: healthData.map(log => parseFloat(log.water) || 0),
                        borderColor: '#5D878F',
                        backgroundColor: 'rgba(93, 135, 143, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Coffee (cups)',
                        data: healthData.map(log => parseFloat(log.coffee) || 0),
                        borderColor: '#964325',
                        backgroundColor: 'rgba(150, 67, 37, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Coke (cans)',
                        data: healthData.map(log => parseFloat(log.coke) || 0),
                        borderColor: '#B4413C',
                        backgroundColor: 'rgba(180, 65, 60, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    renderMoodPieChart(moodCounts) {
        const ctx = document.getElementById('mood-pie-chart');
        if (!ctx) return;
        
        // DESTROY OLD CHART FIRST
        if (this.healthCharts.moodPie) {
            this.healthCharts.moodPie.destroy();
            this.healthCharts.moodPie = null;
        }
        
        const moodEmojis = {
            'Excellent': '😄',
            'Good': '🙂',
            'Okay': '😐',
            'Bad': '😔',
            'Terrible': '😢'
        };
        
        const labels = Object.keys(moodCounts).map(mood => `${moodEmojis[mood] || ''} ${mood}`);
        const data = Object.values(moodCounts);
        const colors = ['#1FB8CD', '#FFC185', '#ECEBD5', '#B4413C', '#944454'];
        
        this.healthCharts.moodPie = new Chart(ctx, {
            type: 'pie',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: colors.slice(0, labels.length)
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    }
    
    renderExerciseMoodChart(healthData) {
        const ctx = document.getElementById('exercise-mood-chart');
        if (!ctx) return;
        
        // DESTROY OLD CHART FIRST
        if (this.healthCharts.exerciseMood) {
            this.healthCharts.exerciseMood.destroy();
            this.healthCharts.exerciseMood = null;
        }
        
        const moodValues = {
            'Excellent': 5,
            'Good': 4,
            'Okay': 3,
            'Bad': 2,
            'Terrible': 1
        };
        
        const data = healthData.map(log => ({
            x: parseFloat(log.exerciseDuration) || 0,
            y: moodValues[log.mood] || 3
        }));
        
        this.healthCharts.exerciseMood = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Exercise vs Mood',
                    data,
                    backgroundColor: '#1FB8CD',
                    borderColor: '#1FB8CD'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Exercise Duration (minutes)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Mood Score'
                        },
                        min: 1,
                        max: 5,
                        ticks: {
                            callback: function(value) {
                                const labels = ['', 'Terrible', 'Bad', 'Okay', 'Good', 'Excellent'];
                                return labels[value] || value;
                            }
                        }
                    }
                }
            }
        });
    }
    
    renderSleepMoodChart(healthData) {
        const ctx = document.getElementById('sleep-mood-chart');
        if (!ctx) return;
        
        // DESTROY OLD CHART FIRST
        if (this.healthCharts.sleepMood) {
            this.healthCharts.sleepMood.destroy();
            this.healthCharts.sleepMood = null;
        }
        
        const moodValues = {
            'Excellent': 5,
            'Good': 4,
            'Okay': 3,
            'Bad': 2,
            'Terrible': 1
        };
        
        const data = healthData.map(log => ({
            x: parseFloat(log.sleep) || 0,
            y: moodValues[log.mood] || 3
        }));
        
        this.healthCharts.sleepMood = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Sleep vs Mood',
                    data,
                    backgroundColor: '#5D878F',
                    borderColor: '#5D878F'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Sleep Duration (hours)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Mood Score'
                        },
                        min: 1,
                        max: 5,
                        ticks: {
                            callback: function(value) {
                                const labels = ['', 'Terrible', 'Bad', 'Okay', 'Good', 'Excellent'];
                                return labels[value] || value;
                            }
                        }
                    }
                }
            }
        });
    }
    
    showHealthModal(health = null) {
        const isEdit = !!health;
        const exerciseTypes = ['Running', 'Cycling', 'Swimming', 'Gym/Weights', 'Yoga', 'Sports', 'Other'];
        const currentExerciseTypes = health?.exerciseTypes || [];
        
        const modalContent = `
            <div class="modal-header">
                <h3 class="modal-title">${isEdit ? 'Edit Health Log' : 'Daily Health Log'}</h3>
                <button class="close-btn" onclick="lifeHub.closeModal()">&times;</button>
            </div>
            <form id="health-form">
                <div class="form-group">
                    <label class="form-label">Date</label>
                    <input type="date" class="form-control" name="date" value="${health?.date || this.formatDateISO(new Date())}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Sleep (hours)</label>
                    <input type="number" class="form-control" name="sleep" value="${health?.sleep || ''}" min="0" max="24" step="0.5">
                </div>
                <div class="form-group">
                    <label class="form-label">Exercise Types</label>
                    <div class="checkbox-group">
                        ${exerciseTypes.map(type => `
                            <label class="checkbox-item">
                                <input type="checkbox" name="exerciseTypes" value="${type}" 
                                       ${currentExerciseTypes.includes(type) ? 'checked' : ''}>
                                ${type}
                            </label>
                        `).join('')}
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Exercise Duration (minutes)</label>
                    <input type="number" class="form-control" name="exerciseDuration" value="${health?.exerciseDuration || ''}" min="0">
                </div>
                <div class="form-group">
                    <label class="form-label">Water Intake (glasses)</label>
                    <input type="number" class="form-control" name="water" value="${health?.water || ''}" min="0">
                </div>
                <div class="form-group">
                    <label class="form-label">Coffee Consumption (cups)</label>
                    <input type="number" class="form-control" name="coffee" value="${health?.coffee || 0}" min="0" step="0.5">
                </div>
                <div class="form-group">
                    <label class="form-label">Coke/Soda Consumption (cans)</label>
                    <input type="number" class="form-control" name="coke" value="${health?.coke || 0}" min="0" step="0.5">
                </div>
                <div class="form-group">
                    <label class="form-label">Mood</label>
                    <select class="form-control" name="mood">
                        <option value="Excellent" ${health?.mood === 'Excellent' ? 'selected' : ''}>😄 Excellent</option>
                        <option value="Good" ${health?.mood === 'Good' ? 'selected' : ''}>🙂 Good</option>
                        <option value="Okay" ${health?.mood === 'Okay' ? 'selected' : ''}>😐 Okay</option>
                        <option value="Bad" ${health?.mood === 'Bad' ? 'selected' : ''}>😔 Bad</option>
                        <option value="Terrible" ${health?.mood === 'Terrible' ? 'selected' : ''}>😢 Terrible</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Notes</label>
                    <textarea class="form-control" name="notes" rows="3">${health?.notes || ''}</textarea>
                </div>
                <div style="display: flex; gap: 12px; margin-top: 24px;">
                    <button type="submit" class="btn-primary" style="flex: 1;">${isEdit ? 'Update' : 'Save'} Health Log</button>
                    ${isEdit ? `<button type="button" class="btn-danger" onclick="lifeHub.deleteHealthLog(${health.id})">Delete</button>` : ''}
                    <button type="button" class="btn-secondary" onclick="lifeHub.closeModal()">Cancel</button>
                </div>
            </form>
        `;
        
        document.getElementById('modal-content').innerHTML = modalContent;
        document.getElementById('modal-overlay').classList.add('show');
        
        document.getElementById('health-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveHealthLog(new FormData(e.target), health?.id);
        });
    }
    
    saveHealthLog(formData, healthId = null) {
        const healthData = {
            id: healthId || Date.now(),
            date: formData.get('date'),
            sleep: parseFloat(formData.get('sleep')) || 0,
            exerciseTypes: formData.getAll('exerciseTypes'),
            exerciseDuration: parseFloat(formData.get('exerciseDuration')) || 0,
            water: parseFloat(formData.get('water')) || 0,
            coffee: parseFloat(formData.get('coffee')) || 0,
            coke: parseFloat(formData.get('coke')) || 0,
            mood: formData.get('mood'),
            notes: formData.get('notes')
        };
        
        if (healthId) {
            const index = this.data.health.findIndex(h => h.id === healthId);
            this.data.health[index] = healthData;
        } else {
            this.data.health.push(healthData);
        }
        
        this.saveData();
        this.closeModal();
        this.renderHealthDashboard();
    }
    
    deleteHealthLog(healthId) {
        if (confirm('Are you sure you want to delete this health log?')) {
            this.data.health = this.data.health.filter(h => h.id !== healthId);
            this.saveData();
            this.closeModal();
            this.renderHealthDashboard();
        }
    }
    
    // CONTACTS with MIND MAP NETWORK
    renderContactsNetwork() {
        const networkContainer = document.getElementById('contacts-network');
        
        if (!this.data.contacts.length) {
            networkContainer.innerHTML = `
                <div class="contact-card">
                    <h3>No contacts found</h3>
                    <p>Add contacts to see the network visualization.</p>
                </div>
            `;
            return;
        }
        
        networkContainer.innerHTML = `
            <h3>Contact Network</h3>
            <svg class="network-svg" width="100%" height="500"></svg>
            <div id="contacts-list"></div>
        `;
        
        this.renderNetworkVisualization();
        this.renderContactsList();
    }
    
    renderNetworkVisualization() {
        const svg = document.querySelector('.network-svg');
        const width = svg.clientWidth || 800;
        const height = 500;
        
        // Clear existing content
        svg.innerHTML = '';
        
        const contacts = this.data.contacts;
        if (!contacts.length) return;
        
        // Create nodes with positions
        const nodes = contacts.map((contact, index) => {
            const angle = (index * 2 * Math.PI) / contacts.length;
            const radius = Math.min(width, height) * 0.3;
            const centerX = width / 2;
            const centerY = height / 2;
            
            const daysSinceContact = this.getDaysSinceLastContact(contact.lastContact);
            let color = '#1FB8CD'; // Green: recent contact
            if (daysSinceContact > 30) color = '#B4413C'; // Red: long time
            else if (daysSinceContact > 7) color = '#FFC185'; // Orange: medium time
            
            return {
                id: contact.id,
                name: contact.name,
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle),
                color,
                daysSinceContact
            };
        });
        
        // Create links based on connections
        const links = [];
        contacts.forEach(contact => {
            if (contact.connections) {
                contact.connections.forEach(connection => {
                    // Avoid duplicate links
                    if (!links.some(link => 
                        (link.source === contact.id && link.target === connection.contactId) ||
                        (link.source === connection.contactId && link.target === contact.id)
                    )) {
                        links.push({ 
                            source: contact.id, 
                            target: connection.contactId,
                            relationship: connection.relationshipType
                        });
                    }
                });
            }
        });
        
        // Draw links
        links.forEach(link => {
            const sourceNode = nodes.find(n => n.id === link.source);
            const targetNode = nodes.find(n => n.id === link.target);
            
            if (sourceNode && targetNode) {
                const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                group.setAttribute('class', 'connection-link');
                
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', sourceNode.x);
                line.setAttribute('y1', sourceNode.y);
                line.setAttribute('x2', targetNode.x);
                line.setAttribute('y2', targetNode.y);
                line.setAttribute('stroke', this.getConnectionColor(link.relationship));
                line.setAttribute('stroke-width', '3');
                line.setAttribute('stroke-dasharray', '5,5');
                line.style.cursor = 'pointer';
                
                // Add hover effect with tooltip
                const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
                title.textContent = `${link.relationship}${link.notes ? ': ' + link.notes : ''}`;
                line.appendChild(title);
                
                // Add click handler for editing connection
                line.addEventListener('click', () => {
                    this.showConnectionModal(link.source, link.target);
                });
                
                group.appendChild(line);
                svg.appendChild(group);
            }
        });
        
        // Draw nodes
        nodes.forEach(node => {
            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', node.x);
            circle.setAttribute('cy', node.y);
            circle.setAttribute('r', '25');
            circle.setAttribute('fill', node.color);
            circle.setAttribute('stroke', '#fff');
            circle.setAttribute('stroke-width', '3');
            circle.style.cursor = 'pointer';
            
            circle.addEventListener('click', () => this.editContact(node.id));
            
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', node.x);
            text.setAttribute('y', node.y + 40);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('font-size', '12');
            text.setAttribute('font-weight', 'bold');
            text.textContent = node.name.substring(0, 10) + (node.name.length > 10 ? '...' : '');
            
            const daysBadge = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            daysBadge.setAttribute('x', node.x);
            daysBadge.setAttribute('y', node.y + 55);
            daysBadge.setAttribute('text-anchor', 'middle');
            daysBadge.setAttribute('font-size', '10');
            daysBadge.setAttribute('fill', '#666');
            daysBadge.textContent = node.daysSinceContact + ' days ago';
            
            group.appendChild(circle);
            group.appendChild(text);
            group.appendChild(daysBadge);
            svg.appendChild(group);
        });
        
        // Add legend
        const legend = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        legend.setAttribute('transform', 'translate(20, 20)');
        
        const legendItems = [
            { color: '#1FB8CD', label: '≤7 days' },
            { color: '#FFC185', label: '8-30 days' },
            { color: '#B4413C', label: '>30 days' }
        ];
        
        legendItems.forEach((item, index) => {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', 10);
            circle.setAttribute('cy', index * 25 + 10);
            circle.setAttribute('r', 8);
            circle.setAttribute('fill', item.color);
            
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', 25);
            text.setAttribute('y', index * 25 + 15);
            text.setAttribute('font-size', '12');
            text.textContent = item.label;
            
            legend.appendChild(circle);
            legend.appendChild(text);
        });
        
        svg.appendChild(legend);
    }
    
    renderContactsList() {
        const contactsList = document.getElementById('contacts-list');
        
        contactsList.innerHTML = `
            <h3>All Contacts</h3>
            ${this.data.contacts.map(contact => `
                <div class="contact-card">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div class="contact-name">
                                <strong>${contact.name}</strong> (${contact.relationship})
                            </div>
                            ${contact.birthday ? `<div class="contact-birthday">Birthday: ${this.formatDate(new Date(contact.birthday))}</div>` : ''}
                            ${contact.lastContact ? `<div class="contact-last">Last contact: ${this.formatDate(new Date(contact.lastContact))} (${this.getDaysSinceLastContact(contact.lastContact)} days ago)</div>` : ''}
                            ${contact.connections && contact.connections.length ? `
                                <div class="contact-connections">
                                    <strong>Connections:</strong> 
                                    ${contact.connections.map(conn => {
                                        const connectedContact = this.data.contacts.find(c => c.id === conn.contactId);
                                        return connectedContact ? `<span class="tag">${connectedContact.name} (${conn.relationshipType})</span>` : '';
                                    }).join('')}
                                </div>
                            ` : ''}
                            ${contact.notes ? `<div class="contact-notes">${contact.notes}</div>` : ''}
                        </div>
                        <div>
                            <button class="btn-secondary btn-sm" onclick="lifeHub.showQuickConnectModal(${contact.id})">Connect</button>
                            <button class="btn-secondary btn-sm" onclick="lifeHub.editContact(${contact.id})">Edit</button>
                            <button class="btn-danger btn-sm" onclick="lifeHub.deleteContact(${contact.id})">Delete</button>
                        </div>
                    </div>
                </div>
            `).join('')}
        `;
    }
    
    getDaysSinceLastContact(lastContactDate) {
        if (!lastContactDate) return 999;
        const now = new Date();
        const lastContact = new Date(lastContactDate);
        const diffTime = now.getTime() - lastContact.getTime();
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }
    
    showContactModal(contact = null) {
        const isEdit = !!contact;
        const otherContacts = this.data.contacts.filter(c => !contact || c.id !== contact.id);
        const relationshipTypes = ['Friend', 'Family', 'Colleague', 'Acquaintance', 'Partner', 'Other'];
        
        const modalContent = `
            <div class="modal-header">
                <h3 class="modal-title">${isEdit ? 'Edit Contact' : 'New Contact'}</h3>
                <button class="close-btn" onclick="lifeHub.closeModal()">&times;</button>
            </div>
            <form id="contact-form">
                <div class="form-group">
                    <label class="form-label">Name</label>
                    <input type="text" class="form-control" name="name" value="${contact?.name || ''}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Relationship</label>
                    <select class="form-control" name="relationship" required>
                        ${relationshipTypes.map(type => `<option value="${type}" ${contact?.relationship === type ? 'selected' : ''}>${type}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Birthday</label>
                    <input type="date" class="form-control" name="birthday" value="${contact?.birthday || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">Last Contact</label>
                    <input type="date" class="form-control" name="lastContact" value="${contact?.lastContact || ''}">
                </div>
                
                ${otherContacts.length ? `
                <div class="form-group">
                    <label class="form-label">Connections</label>
                    <div id="connections-container">
                        ${contact?.connections ? contact.connections.map((conn, index) => {
                            const connectedContact = otherContacts.find(c => c.id === conn.contactId);
                            return `
                                <div class="dynamic-item">
                                    <select class="form-control" name="connectionContact_${index}" style="flex: 2;">
                                        ${otherContacts.map(c => `<option value="${c.id}" ${c.id === conn.contactId ? 'selected' : ''}>${c.name}</option>`).join('')}
                                    </select>
                                    <select class="form-control" name="connectionType_${index}" style="flex: 1;">
                                        ${relationshipTypes.map(type => `<option value="${type}" ${conn.type === type ? 'selected' : ''}>${type}</option>`).join('')}
                                    </select>
                                    <input type="text" class="form-control" name="connectionNotes_${index}" placeholder="How they know each other" value="${conn.notes || ''}" style="flex: 2;">
                                    <button type="button" onclick="this.parentElement.remove()">Remove</button>
                                </div>
                            `;
                        }).join('') : ''}
                    </div>
                    <div class="add-item-btn" onclick="lifeHub.addContactConnection()">+ Add Connection</div>
                </div>` : ''}
                
                <div class="form-group">
                    <label class="form-label">Notes</label>
                    <textarea class="form-control" name="notes" rows="3">${contact?.notes || ''}</textarea>
                </div>
                <div style="display: flex; gap: 12px; margin-top: 24px;">
                    <button type="submit" class="btn-primary" style="flex: 1;">${isEdit ? 'Update' : 'Add'} Contact</button>
                    ${isEdit ? `<button type="button" class="btn-danger" onclick="lifeHub.deleteContact(${contact.id})">Delete</button>` : ''}
                    <button type="button" class="btn-secondary" onclick="lifeHub.closeModal()">Cancel</button>
                </div>
            </form>
        `;
        
        document.getElementById('modal-content').innerHTML = modalContent;
        document.getElementById('modal-overlay').classList.add('show');
        
        document.getElementById('contact-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveContact(new FormData(e.target), contact?.id);
        });
    }
    
    addContactConnection() {
        const container = document.getElementById('connections-container');
        const index = container.children.length;
        const otherContacts = this.data.contacts;
        const relationshipTypes = ['Friend', 'Family', 'Colleague', 'Acquaintance', 'Partner', 'Other'];
        
        const connectionHtml = `
            <div class="dynamic-item">
                <select class="form-control" name="connectionContact_${index}" style="flex: 2;">
                    ${otherContacts.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                </select>
                <select class="form-control" name="connectionType_${index}" style="flex: 1;">
                    ${relationshipTypes.map(type => `<option value="${type}">${type}</option>`).join('')}
                </select>
                <input type="text" class="form-control" name="connectionNotes_${index}" placeholder="How they know each other" style="flex: 2;">
                <button type="button" onclick="this.parentElement.remove()">Remove</button>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', connectionHtml);
    }
    
    saveContact(formData, contactId = null) {
        // Extract connections
        const connections = [];
        for (const [key, value] of formData.entries()) {
            if (key.startsWith('connectionContact_')) {
                const index = key.split('_')[1];
                const type = formData.get(`connectionType_${index}`);
                const notes = formData.get(`connectionNotes_${index}`);
                connections.push({
                    contactId: parseInt(value),
                    type: type,
                    notes: notes || ''
                });
            }
        }
        
        const contactData = {
            id: contactId || Date.now(),
            name: formData.get('name'),
            relationship: formData.get('relationship'),
            birthday: formData.get('birthday') || null,
            lastContact: formData.get('lastContact') || null,
            connections,
            notes: formData.get('notes')
        };
        
        if (contactId) {
            const index = this.data.contacts.findIndex(c => c.id === contactId);
            this.data.contacts[index] = contactData;
        } else {
            this.data.contacts.push(contactData);
        }
        
        this.saveData();
        this.closeModal();
        this.renderContactsNetwork();
    }
    
    editContact(contactId) {
        const contact = this.data.contacts.find(c => c.id === contactId);
        if (contact) this.showContactModal(contact);
    }
    
    deleteContact(contactId) {
        if (confirm('Are you sure you want to delete this contact?')) {
            // Remove contact and all references to it in other contacts
            this.data.contacts = this.data.contacts.filter(c => c.id !== contactId);
            
            // Clean up connections
            this.data.contacts.forEach(contact => {
                if (contact.connections) {
                    contact.connections = contact.connections.filter(conn => conn.contactId !== contactId);
                }
            });
            
            this.saveData();
            this.closeModal();
            this.renderContactsNetwork();
        }
    }
    
    getConnectionColor(relationshipType) {
        const colors = {
            'Friend': '#1FB8CD',
            'Family': '#B4413C', 
            'Colleague': '#5D878F',
            'Acquaintance': '#ECEBD5',
            'Partner': '#944454',
            'Other': '#D2BA4C'
        };
        return colors[relationshipType] || '#ccc';
    }
    
    showConnectionModal(sourceId, targetId) {
        const sourceContact = this.data.contacts.find(c => c.id === sourceId);
        const targetContact = this.data.contacts.find(c => c.id === targetId);
        
        if (!sourceContact || !targetContact) return;
        
        const connection = sourceContact.connections?.find(c => c.contactId === targetId);
        const relationshipTypes = ['Friend', 'Family', 'Colleague', 'Acquaintance', 'Partner', 'Other'];
        
        const modalContent = `
            <div class="modal-header">
                <h3 class="modal-title">Edit Connection</h3>
                <button class="close-btn" onclick="lifeHub.closeModal()">&times;</button>
            </div>
            <form id="connection-form">
                <div class="form-group">
                    <div class="card-label">
                        <strong>${sourceContact.name}</strong> connected to <strong>${targetContact.name}</strong>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Relationship Type</label>
                    <select class="form-control" name="relationshipType" required>
                        ${relationshipTypes.map(type => `
                            <option value="${type}" ${connection?.type === type ? 'selected' : ''}>${type}</option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Notes</label>
                    <textarea class="form-control" name="notes" rows="3" placeholder="How they know each other...">${connection?.notes || ''}</textarea>
                </div>
                
                <div style="display: flex; gap: 12px; margin-top: 24px;">
                    <button type="submit" class="btn-primary" style="flex: 1;">Update Connection</button>
                    <button type="button" class="btn-danger" onclick="lifeHub.deleteConnection(${sourceId}, ${targetId})">Delete Connection</button>
                    <button type="button" class="btn-secondary" onclick="lifeHub.closeModal()">Cancel</button>
                </div>
            </form>
        `;
        
        document.getElementById('modal-content').innerHTML = modalContent;
        document.getElementById('modal-overlay').classList.add('show');
        
        document.getElementById('connection-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateConnection(sourceId, targetId, new FormData(e.target));
        });
    }
    
    updateConnection(sourceId, targetId, formData) {
        const sourceContact = this.data.contacts.find(c => c.id === sourceId);
        if (!sourceContact || !sourceContact.connections) return;
        
        const connectionIndex = sourceContact.connections.findIndex(c => c.contactId === targetId);
        if (connectionIndex >= 0) {
            sourceContact.connections[connectionIndex] = {
                contactId: targetId,
                type: formData.get('relationshipType'),
                notes: formData.get('notes')
            };
        }
        
        this.saveData();
        this.closeModal();
        this.renderContactsNetwork();
    }
    
    deleteConnection(sourceId, targetId) {
        if (!confirm('Are you sure you want to delete this connection?')) return;
        
        const sourceContact = this.data.contacts.find(c => c.id === sourceId);
        if (sourceContact && sourceContact.connections) {
            sourceContact.connections = sourceContact.connections.filter(c => c.contactId !== targetId);
        }
        
        // Also remove reverse connection if it exists
        const targetContact = this.data.contacts.find(c => c.id === targetId);
        if (targetContact && targetContact.connections) {
            targetContact.connections = targetContact.connections.filter(c => c.contactId !== sourceId);
        }
        
        this.saveData();
        this.closeModal();
        this.renderContactsNetwork();
    }
    
    showQuickConnectModal(contactId) {
        const contact = this.data.contacts.find(c => c.id === contactId);
        const otherContacts = this.data.contacts.filter(c => c.id !== contactId);
        
        if (!contact || !otherContacts.length) {
            alert('No other contacts available to connect.');
            return;
        }
        
        const relationshipTypes = ['Friend', 'Family', 'Colleague', 'Acquaintance', 'Partner', 'Other'];
        
        const modalContent = `
            <div class="modal-header">
                <h3 class="modal-title">Quick Connect: ${contact.name}</h3>
                <button class="close-btn" onclick="lifeHub.closeModal()">&times;</button>
            </div>
            <form id="quick-connect-form">
                <div class="form-group">
                    <label class="form-label">Connect ${contact.name} to:</label>
                    <select class="form-control" name="targetContactId" required>
                        <option value="">Select Contact</option>
                        ${otherContacts.map(c => `
                            <option value="${c.id}">${c.name}</option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Relationship Type</label>
                    <select class="form-control" name="relationshipType" required>
                        ${relationshipTypes.map(type => `<option value="${type}">${type}</option>`).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Notes</label>
                    <input type="text" class="form-control" name="notes" placeholder="How they know each other">
                </div>
                
                <div style="display: flex; gap: 12px; margin-top: 24px;">
                    <button type="submit" class="btn-primary" style="flex: 1;">Add Connection</button>
                    <button type="button" class="btn-secondary" onclick="lifeHub.closeModal()">Cancel</button>
                </div>
            </form>
        `;
        
        document.getElementById('modal-content').innerHTML = modalContent;
        document.getElementById('modal-overlay').classList.add('show');
        
        document.getElementById('quick-connect-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveQuickConnection(contactId, new FormData(e.target));
        });
    }
    
    saveQuickConnection(sourceId, formData) {
        const targetId = parseInt(formData.get('targetContactId'));
        const relationshipType = formData.get('relationshipType');
        const notes = formData.get('notes');
        
        const sourceContact = this.data.contacts.find(c => c.id === sourceId);
        if (!sourceContact) return;
        
        // Initialize connections array if it doesn't exist
        if (!sourceContact.connections) {
            sourceContact.connections = [];
        }
        
        // Check if connection already exists
        const existingConnection = sourceContact.connections.find(c => c.contactId === targetId);
        if (existingConnection) {
            alert('Connection already exists!');
            return;
        }
        
        // Add the connection
        sourceContact.connections.push({
            contactId: targetId,
            type: relationshipType,
            notes: notes || ''
        });
        
        this.saveData();
        this.closeModal();
        this.renderContactsNetwork();
        
        const targetContact = this.data.contacts.find(c => c.id === targetId);
        alert(`Connected ${sourceContact.name} to ${targetContact.name} as ${relationshipType}!`);
    }
    
    // SAVE/LOAD SYSTEM
    showSavesModal() {
        const saves = this.getSaves();
        
        const modalContent = `
            <div class="modal-header">
                <h3 class="modal-title">Save & Load Data</h3>
                <button class="close-btn" onclick="lifeHub.closeModal()">&times;</button>
            </div>
            <div>
                <div class="form-group">
                    <label class="form-label">Create New Save</label>
                    <div style="display: flex; gap: 8px;">
                        <input type="text" class="form-control" id="save-name" placeholder="Save name" style="flex: 1;">
                        <button class="btn-primary" onclick="lifeHub.createSave()">Save</button>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Load Existing Save</label>
                    <div id="saves-list">
                        ${saves.length ? saves.map(save => `
                            <div class="save-item" style="display: flex; justify-content: space-between; align-items: center; padding: 8px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 8px;">
                                <div>
                                    <strong>${save.name}</strong>
                                    <div style="font-size: 12px; color: #666;">${new Date(save.timestamp).toLocaleString()}</div>
                                </div>
                                <div>
                                    <button class="btn-secondary btn-sm" onclick="lifeHub.loadSave('${save.name}')">Load</button>
                                    <button class="btn-danger btn-sm" onclick="lifeHub.deleteSave('${save.name}')">Delete</button>
                                </div>
                            </div>
                        `).join('') : '<div>No saves found</div>'}
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Export/Import</label>
                    <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                        <button class="btn-secondary" onclick="lifeHub.exportData()">Export JSON</button>
                        <input type="file" id="import-file" accept=".json" style="display: none;" onchange="lifeHub.importData(event)">
                        <button class="btn-secondary" onclick="document.getElementById('import-file').click()">Import JSON</button>
                    </div>
                </div>
                
                <div style="margin-top: 24px;">
                    <button class="btn-secondary" onclick="lifeHub.closeModal()">Close</button>
                </div>
            </div>
        `;
        
        document.getElementById('modal-content').innerHTML = modalContent;
        document.getElementById('modal-overlay').classList.add('show');
    }
    
    createSave() {
        const saveName = document.getElementById('save-name').value.trim();
        if (!saveName) {
            alert('Please enter a save name');
            return;
        }
        
        const saveData = {
            name: saveName,
            timestamp: Date.now(),
            data: JSON.parse(JSON.stringify(this.data))
        };
        
        const saves = this.getSaves();
        const existingIndex = saves.findIndex(save => save.name === saveName);
        
        if (existingIndex >= 0) {
            if (!confirm('A save with this name already exists. Overwrite?')) {
                return;
            }
            saves[existingIndex] = saveData;
        } else {
            saves.push(saveData);
        }
        
        const saves_data = {};
        saves_data['lifeHubSaves'] = saves;
        Object.keys(saves_data).forEach(key => {
            try {
                const jsonString = JSON.stringify(saves_data[key]);
                // Store in variables instead of localStorage due to sandbox restrictions
                window[key] = saves_data[key];
                console.log('Saved to memory:', key);
            } catch (error) {
                console.error('Error saving data:', error);
            }
        });
        
        alert('Save created successfully!');
        this.showSavesModal();
    }
    
    loadSave(saveName) {
        if (!confirm('Loading will replace all current data. Continue?')) {
            return;
        }
        
        const saves = this.getSaves();
        const save = saves.find(s => s.name === saveName);
        
        if (save) {
            this.data = save.data;
            this.saveData();
            this.renderCurrentModule();
            alert('Save loaded successfully!');
            this.closeModal();
        } else {
            alert('Save not found');
        }
    }
    
    deleteSave(saveName) {
        if (!confirm('Are you sure you want to delete this save?')) {
            return;
        }
        
        const saves = this.getSaves().filter(save => save.name !== saveName);
        const saves_data = {};
        saves_data['lifeHubSaves'] = saves;
        Object.keys(saves_data).forEach(key => {
            try {
                window[key] = saves_data[key];
                console.log('Updated saves in memory:', key);
            } catch (error) {
                console.error('Error updating saves:', error);
            }
        });
        
        this.showSavesModal();
    }
    
    getSaves() {
        try {
            return window['lifeHubSaves'] || [];
        } catch (error) {
            console.error('Error loading saves:', error);
            return [];
        }
    }
    
    exportData() {
        const dataStr = JSON.stringify(this.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `lifehub-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
    
    importData(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                
                if (!confirm('Importing will replace all current data. Continue?')) {
                    return;
                }
                
                this.data = importedData;
                this.saveData();
                this.renderCurrentModule();
                alert('Data imported successfully!');
                this.closeModal();
            } catch (error) {
                alert('Error importing data: ' + error.message);
            }
        };
        reader.readAsText(file);
    }
    
    projectAssetPortfolio(years) {
        const months = years * 12;
        const monthlyNet = this.calculateMonthlyNet();
        
        // Get starting values
        const assetData = {};
        this.data.assets.forEach(asset => {
            assetData[asset.id] = {
                name: asset.name,
                type: asset.type,
                currentValue: parseFloat(asset.currentValue) || 0,
                annualRate: parseFloat(asset.appreciation) || 0,
                monthlyRate: ((parseFloat(asset.appreciation) || 0) / 100) / 12,
                isAutoTransferTarget: this.data.autoSavings?.enabled && this.data.autoSavings?.targetAssetId === asset.id,
                monthlyValues: [parseFloat(asset.currentValue) || 0]
            };
        });
        
        const projections = [];
        
        // Project each month
        for (let month = 1; month <= months; month++) {
            let monthTotal = 0;
            
            Object.keys(assetData).forEach(assetId => {
                const asset = assetData[assetId];
                const lastValue = asset.monthlyValues[asset.monthlyValues.length - 1];
                
                // Add monthly contribution if this is the target
                const contribution = asset.isAutoTransferTarget ? monthlyNet : 0;
                
                // Compound: FV = (PV + Contribution) × (1 + r)
                const newValue = (lastValue + contribution) * (1 + asset.monthlyRate);
                
                asset.monthlyValues.push(newValue);
                monthTotal += newValue;
            });
            
            // Create month label
            const date = new Date();
            date.setMonth(date.getMonth() + month);
            const label = (date.getMonth() + 1) + '/' + date.getFullYear().toString().substr(-2);
            
            projections.push({
                month: month,
                label: label,
                total: monthTotal,
                assets: JSON.parse(JSON.stringify(assetData)) // Deep copy
            });
        }
        
        // Validation check
        const currentTotal = Object.values(assetData).reduce((sum, a) => sum + a.currentValue, 0);
        const projectedTotal = projections.length > 0 ? projections[projections.length - 1].total : 0;
        if (projectedTotal > currentTotal * 1000) {
            console.warn('Projection seems unrealistic:', { currentTotal, projectedTotal, monthlyNet });
        }
        
        return { projections, assetData, monthlyNet };
    }
    
    formatMonthLabel(month) {
        const date = new Date();
        date.setMonth(date.getMonth() + month);
        return `${date.getMonth() + 1}/${date.getFullYear()}`;
    }
    
    calculateMonthlyNet() {
        // Use the same calculation as the dashboard for consistency
        const financeData = this.calculateMonthlyFinances();
        return Math.max(0, financeData.net); // Only positive values for projection
    }
    
    renderAssetProjectionCards(years, result) {
        const cardsContainer = document.getElementById('asset-projection-cards');
        if (!cardsContainer || !result || !result.projections.length) return;
        
        const { projections, assetData } = result;
        const finalProjection = projections[projections.length - 1];
        
        let html = '';
        Object.keys(assetData).forEach(assetId => {
            const asset = assetData[assetId];
            const currentValue = asset.currentValue;
            const futureValue = asset.monthlyValues[asset.monthlyValues.length - 1];
            const growth = futureValue - currentValue;
            const growthPercent = currentValue > 0 ? (growth / currentValue * 100).toFixed(1) : '0.0';
            
            // Format large numbers with K/M notation
            const formatCurrency = (value) => {
                if (value >= 1000000) {
                    return '$' + (value / 1000000).toFixed(1) + 'M';
                } else if (value >= 1000) {
                    return '$' + (value / 1000).toFixed(1) + 'K';
                }
                return '$' + value.toFixed(2);
            };
            
            html += `
            <div class="asset-projection-card" style="background:var(--color-surface);padding:16px;border-radius:12px;box-shadow:var(--shadow-sm);border: 1px solid var(--color-card-border)">
                <div style="font-weight:600;font-size:1.1rem">${asset.name}</div>
                <div style="color:var(--color-text-secondary);font-size:0.85rem;margin:4px 0">Type: ${asset.type}</div>
                <div style="color:var(--color-text-secondary);font-size:0.85rem">Current: ${formatCurrency(currentValue)}</div>
                <div style="color:var(--color-text-secondary);font-size:0.85rem">Growth Rate: ${asset.annualRate}%/year</div>
                <div style="font-size:1.3rem;font-weight:700;color:#667eea;margin-top:8px">
                    ${formatCurrency(futureValue)}
                </div>
                <div style="color:var(--color-success);font-size:0.9rem;font-weight:600">
                    +${formatCurrency(growth)} (+${growthPercent}%)
                </div>
            </div>
            `;
        });
        
        cardsContainer.innerHTML = html;
    }
    
    renderPortfolioSummary(years, result) {
        const summaryContainer = document.getElementById('portfolio-summary');
        if (!summaryContainer || !result || !result.projections.length) return;
        
        const { projections, assetData, monthlyNet } = result;
        const finalProjection = projections[projections.length - 1];
        
        const currentTotal = Object.values(assetData).reduce((sum, a) => sum + a.currentValue, 0);
        const projectedTotal = finalProjection.total;
        const totalGrowth = projectedTotal - currentTotal;
        const growthPercent = currentTotal > 0 ? (totalGrowth / currentTotal * 100).toFixed(1) : '0.0';
        
        // Calculate weighted average return
        let weightedReturn = 0;
        if (currentTotal > 0) {
            Object.values(assetData).forEach(asset => {
                const weight = asset.currentValue / currentTotal;
                weightedReturn += weight * asset.annualRate;
            });
        }
        
        // Format large numbers with K/M notation
        const formatCurrency = (value) => {
            if (value >= 1000000) {
                return '$' + (value / 1000000).toFixed(1) + 'M';
            } else if (value >= 1000) {
                return '$' + (value / 1000).toFixed(1) + 'K';
            }
            return '$' + value.toFixed(2);
        };
        
        summaryContainer.innerHTML = `
            <strong>📈 Portfolio Summary:</strong>
            <ul style="margin:8px 0;padding-left:20px">
                <li>Current Total: <strong>${formatCurrency(currentTotal)}</strong></li>
                <li>Monthly Net: <strong>${formatCurrency(monthlyNet)}</strong></li>
                <li>Weighted Return: <strong>${weightedReturn.toFixed(1)}%</strong></li>
                <li>Projected (${years} year${years > 1 ? 's' : ''}): <strong>${formatCurrency(projectedTotal)}</strong></li>
                <li>Total Growth: <strong>${formatCurrency(totalGrowth)} (+${growthPercent}%)</strong></li>
            </ul>
        `;
    }
    
    // Modal confirmation handlers
    initializeModalHandlers() {
        const overlay = document.getElementById('modal-overlay');
        
        overlay.addEventListener('click', (event) => {
            // Only trigger if clicking the overlay itself (not modal content)
            if (event.target === overlay) {
                // Check if any form inputs have values
                const hasInput = this.checkForUnsavedInput();
                
                if (hasInput) {
                    // Show confirmation dialog
                    if (confirm('Exit without saving? All changes will be lost.')) {
                        this.closeModal();
                    }
                    // If user clicks "Cancel", modal stays open
                } else {
                    // No input, close immediately
                    this.closeModal();
                }
            }
        });
    }
    
    checkForUnsavedInput() {
        const modal = document.getElementById('modal-content');
        
        // Check all text inputs
        const textInputs = modal.querySelectorAll('input[type="text"], input[type="number"], input[type="date"], input[type="time"], input[type="email"]');
        for (let input of textInputs) {
            if (input.value.trim() !== '' && input.value !== input.defaultValue) {
                return true;
            }
        }
        
        // Check textareas
        const textareas = modal.querySelectorAll('textarea');
        for (let textarea of textareas) {
            if (textarea.value.trim() !== '' && textarea.value !== textarea.defaultValue) {
                return true;
            }
        }
        
        // Check selects (if changed from default)
        const selects = modal.querySelectorAll('select');
        for (let select of selects) {
            if (select.selectedIndex !== 0) {
                return true;
            }
        }
        
        // Check checkboxes
        const checkboxes = modal.querySelectorAll('input[type="checkbox"]');
        for (let checkbox of checkboxes) {
            if (checkbox.checked !== checkbox.defaultChecked) {
                return true;
            }
        }
        
        return false;
    }
    
    closeModalWithConfirm() {
        const hasInput = this.checkForUnsavedInput();
        if (hasInput) {
            if (confirm('Discard changes?')) {
                this.closeModal();
            }
        } else {
            this.closeModal();
        }
    }
    
    updateDaysSummary() {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const selected = [];
        
        document.querySelectorAll('.day-checkbox').forEach(checkbox => {
            if (checkbox.checked) {
                const dayIndex = parseInt(checkbox.getAttribute('data-day'));
                selected.push(days[dayIndex]);
            }
        });
        
        const summary = document.getElementById('daysSummary');
        if (summary) {
            if (selected.length > 0) {
                summary.textContent = 'Repeats on: ' + selected.join(', ');
                summary.style.color = '#667eea';
                summary.style.fontWeight = '600';
            } else {
                summary.textContent = 'Select at least one day';
                summary.style.color = '#ff3b30';
            }
        }
    }

    // UTILITY METHODS
    saveData() {
        // Auto-save after every change to memory variables
        try {
            window['lifeHubV2'] = this.data;
            console.log('Data auto-saved to memory');
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }
    
    loadData() {
        try {
            const savedData = window['lifeHubV2'];
            if (savedData) {
                this.data = { ...this.data, ...savedData };
                console.log('Data loaded from memory');
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }
    
    formatDate(date) {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    formatDateISO(date) {
        return date.toISOString().split('T')[0];
    }
    
    formatTime(hour, minute) {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${displayHour}:${this.padZero(minute)} ${period}`;
    }
    
    padZero(num) {
        return num.toString().padStart(2, '0');
    }
    
    getStartOfWeek(date) {
        const result = new Date(date);
        const day = result.getDay();
        const diff = result.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
        result.setDate(diff);
        return result;
    }
    
    changeWeek(direction) {
        this.currentWeek.setDate(this.currentWeek.getDate() + (direction * 7));
        this.renderCalendar();
    }
    
    goToToday() {
        this.currentWeek = new Date();
        this.renderCalendar();
    }
    
    // Helper method for displaying frequency
    getFrequencyDisplay(frequency, selectedDays) {
        switch (frequency) {
            case 'daily': return 'Daily';
            case 'weekly': {
                if (!selectedDays) return 'Weekly';
                const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const activeDays = selectedDays.map((active, index) => active ? dayNames[index] : null).filter(Boolean);
                return activeDays.length ? `Weekly (${activeDays.join(', ')})` : 'Weekly';
            }
            case 'biweekly': {
                if (!selectedDays) return 'Bi-weekly';
                const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const activeDays = selectedDays.map((active, index) => active ? dayNames[index] : null).filter(Boolean);
                return activeDays.length ? `Bi-weekly (${activeDays.join(', ')})` : 'Bi-weekly';
            }
            case 'monthly': return 'Monthly';
            case 'yearly': return 'Yearly';
            default: return frequency;
        }
    }
    
    closeModal() {
        document.getElementById('modal-overlay').classList.remove('show');
        
        // Destroy any existing chart instances in modals
        Object.keys(this.charts).forEach(key => {
            if (key.includes('modal')) {
                this.charts[key].destroy();
                delete this.charts[key];
            }
        });
    }
    
    processAutoSavings(netAmount) {
        const targetAsset = this.data.assets.find(a => a.id === this.data.autoSavings.targetAssetId);
        if (!targetAsset) return;
        
        // Check if we already processed this month
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthKey = `${currentYear}-${currentMonth}`;
        
        if (!targetAsset.transactions) targetAsset.transactions = [];
        
        // Check if auto-transfer already happened this month
        const alreadyProcessed = targetAsset.transactions.some(tx => 
            tx.type === 'auto-transfer' && 
            new Date(tx.date).getMonth() === currentMonth && 
            new Date(tx.date).getFullYear() === currentYear
        );
        
        if (alreadyProcessed) {
            return; // Already processed this month
        }
        
        // Add the net amount to the asset
        targetAsset.currentValue = parseFloat(targetAsset.currentValue) + netAmount;
        
        // Log the transaction
        targetAsset.transactions.push({
            date: this.formatDateISO(new Date()),
            amount: netAmount,
            type: 'auto-transfer',
            note: `NET Income Auto-Transfer: $${netAmount.toFixed(2)}`
        });
        
        this.saveData();
        console.log(`Auto-transferred NET $${netAmount.toFixed(2)} to ${targetAsset.name}`);
    }
    
    calculateMonthlyFinances() {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        // 1. Calculate Income
        let income = 0;
        this.data.income.forEach(inc => {
            const d = new Date(inc.date);
            if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
                income += parseFloat(inc.amount);
            }
        });
        
        // Add recurring income
        this.data.income.filter(i => i.recurring).forEach(inc => {
            let monthlyAmount = 0;
            if (inc.recurringFrequency === 'monthly') monthlyAmount = parseFloat(inc.amount);
            else if (inc.recurringFrequency === 'weekly') monthlyAmount = parseFloat(inc.amount) * 4.33;
            else if (inc.recurringFrequency === 'biweekly') monthlyAmount = parseFloat(inc.amount) * 2.165;
            else if (inc.recurringFrequency === 'yearly') monthlyAmount = parseFloat(inc.amount) / 12;
            income += monthlyAmount;
        });
        
        // 2. Calculate Expenses
        let expenses = 0;
        this.data.expenses.forEach(exp => {
            const d = new Date(exp.date);
            if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
                expenses += parseFloat(exp.amount);
            }
        });
        
        // Add recurring expenses
        this.data.expenses.filter(e => e.recurring).forEach(exp => {
            let monthlyAmount = 0;
            if (exp.recurringFrequency === 'monthly') monthlyAmount = parseFloat(exp.amount);
            else if (exp.recurringFrequency === 'weekly') monthlyAmount = parseFloat(exp.amount) * 4.33;
            else if (exp.recurringFrequency === 'biweekly') monthlyAmount = parseFloat(exp.amount) * 2.165;
            else if (exp.recurringFrequency === 'yearly') monthlyAmount = parseFloat(exp.amount) / 12;
            expenses += monthlyAmount;
        });
        
        // 3. Calculate Tax
        let tax = 0;
        this.data.income.forEach(inc => {
            const d = new Date(inc.date);
            if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
                tax += parseFloat(inc.amount) * ((parseFloat(inc.taxRate) || 0) / 100);
            }
        });
        
        // Tax deductions
        let deductions = 0;
        this.data.expenses.forEach(exp => {
            const d = new Date(exp.date);
            if (d.getMonth() === currentMonth && d.getFullYear() === currentYear && exp.taxDeductible) {
                deductions += parseFloat(exp.amount);
            }
        });
        
        const adjustedTax = Math.max(0, tax - (deductions * (this.data.globalTaxRate / 100)));
        
        // 4. Calculate NET
        const net = income - expenses - adjustedTax;
        
        return {
            income: income,
            expenses: expenses,
            tax: adjustedTax,
            net: net // THIS IS WHAT GETS TRANSFERRED
        };
    }
    
    processAutoTransfer(netAmount) {
        if (!this.data.autoSavings.enabled || netAmount <= 0) return;
        
        const targetAsset = this.data.assets.find(a => a.id === this.data.autoSavings.targetAssetId);
        if (!targetAsset) return;
        
        // Check if we already processed this month
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        if (!targetAsset.transactions) targetAsset.transactions = [];
        
        // Check if auto-transfer already happened this month
        const alreadyProcessed = targetAsset.transactions.some(tx => 
            tx.type === 'auto-transfer' && 
            new Date(tx.date).getMonth() === currentMonth && 
            new Date(tx.date).getFullYear() === currentYear
        );
        
        if (alreadyProcessed) {
            return; // Already processed this month
        }
        
        // Add the NET amount to the asset
        targetAsset.currentValue = parseFloat(targetAsset.currentValue) + netAmount;
        
        // Log the transaction
        targetAsset.transactions.push({
            date: this.formatDateISO(new Date()),
            amount: netAmount,
            type: 'auto-transfer',
            note: `NET Income Auto-Transfer: $${netAmount.toFixed(2)}`
        });
        
        this.saveData();
        console.log(`Auto-transferred NET $${netAmount.toFixed(2)} to ${targetAsset.name}`);
    }
}

// Initialize the app
const lifeHub = new LifeHub();

// Make it globally available for inline event handlers
window.lifeHub = lifeHub;