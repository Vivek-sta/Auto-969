 // Workflow Engine
        class WorkflowEngine {
            constructor() {
                this.workflows = this.loadWorkflows();
                this.currentWorkflow = [];
            }

            // Load workflows from localStorage
            loadWorkflows() {
                const stored = localStorage.getItem('autoflow-workflows');
                return stored ? JSON.parse(stored) : [];
            }

            // Save workflows to localStorage
            saveWorkflows() {
                localStorage.setItem('autoflow-workflows', JSON.stringify(this.workflows));
            }

            // Add a workflow
            addWorkflow(name, description, steps) {
                const workflow = {
                    id: Date.now().toString(),
                    name,
                    description,
                    steps,
                    created: new Date().toISOString()
                };
                this.workflows.push(workflow);
                this.saveWorkflows();
                return workflow;
            }

            // Get a workflow by ID
            getWorkflow(id) {
                return this.workflows.find(w => w.id === id);
            }

            // Update a workflow
            updateWorkflow(id, name, description, steps) {
                const index = this.workflows.findIndex(w => w.id === id);
                if (index !== -1) {
                    this.workflows[index] = {
                        ...this.workflows[index],
                        name,
                        description,
                        steps,
                        updated: new Date().toISOString()
                    };
                    this.saveWorkflows();
                    return this.workflows[index];
                }
                return null;
            }

            // Delete a workflow
            deleteWorkflow(id) {
                this.workflows = this.workflows.filter(w => w.id !== id);
                this.saveWorkflows();
            }

            // Execute a workflow
            async executeWorkflow(steps) {
                for (let i = 0; i < steps.length; i++) {
                    const step = steps[i];
                    try {
                        // Update UI to show current step
                        this.highlightStep(i);
                        
                        // Simulate execution with a delay
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        
                        // Execute the step based on its type
                        await this.executeStep(step);
                    } catch (error) {
                        console.error(`Error executing step ${i}:`, error);
                        alert(`Error executing step ${i + 1}: ${step.name}. Check the console for details.`);
                        break;
                    }
                }
                
                // Reset UI after execution
                this.resetStepHighlights();
                alert('Workflow execution completed!');
            }

            // Execute a single step
            async executeStep(step) {
                switch (step.type) {
                    case 'fill-form':
                        // In a real implementation, this would interact with forms on the page
                        console.log('Filling form with data:', step.data);
                        break;
                    case 'click-button':
                        // In a real implementation, this would find and click buttons
                        console.log('Clicking button:', step.data);
                        break;
                    case 'send-notification':
                        // Show a browser notification if permitted
                        if ('Notification' in window && Notification.permission === 'granted') {
                            new Notification('AutoFlow Notification', {
                                body: step.data.message || 'Your automation has reached this step'
                            });
                        }
                        console.log('Sending notification:', step.data);
                        break;
                    case 'extract-data':
                        // In a real implementation, this would extract data from the page
                        console.log('Extracting data:', step.data);
                        break;
                    case 'schedule-task':
                        // In a real implementation, this would schedule a task
                        console.log('Scheduling task:', step.data);
                        break;
                    default:
                        console.warn('Unknown step type:', step.type);
                }
            }

            // Highlight the current step during execution
            highlightStep(index) {
                const steps = document.querySelectorAll('.workflow-step');
                if (steps[index]) {
                    steps[index].classList.add('executing');
                }
            }

            // Reset step highlights after execution
            resetStepHighlights() {
                const steps = document.querySelectorAll('.workflow-step');
                steps.forEach(step => {
                    step.classList.remove('executing');
                });
            }

            // Export workflow as JSON
            exportWorkflow(workflow) {
                return JSON.stringify(workflow, null, 2);
            }

            // Import workflow from JSON
            importWorkflow(json) {
                try {
                    const workflow = JSON.parse(json);
                    // Validate the workflow structure
                    if (workflow.name && workflow.steps && Array.isArray(workflow.steps)) {
                        workflow.id = Date.now().toString();
                        workflow.created = new Date().toISOString();
                        this.workflows.push(workflow);
                        this.saveWorkflows();
                        return workflow;
                    } else {
                        throw new Error('Invalid workflow format');
                    }
                } catch (error) {
                    console.error('Error importing workflow:', error);
                    alert('Error importing workflow. Please check the file format.');
                    return null;
                }
            }
        }

        // Initialize the application
        document.addEventListener('DOMContentLoaded', function() {
            const workflowEngine = new WorkflowEngine();
            let currentWorkflowId = null;

            // Accessibility Features
            const decreaseFontBtn = document.getElementById('decrease-font');
            const resetFontBtn = document.getElementById('reset-font');
            const increaseFontBtn = document.getElementById('increase-font');
            const contrastToggle = document.getElementById('contrast-toggle');
            const themeToggle = document.getElementById('theme-toggle');
            
            decreaseFontBtn.addEventListener('click', function() {
                changeFontSize(-1);
            });
            
            resetFontBtn.addEventListener('click', function() {
                document.body.style.fontSize = '';
            });
            
            increaseFontBtn.addEventListener('click', function() {
                changeFontSize(1);
            });
            
            function changeFontSize(direction) {
                const currentSize = parseFloat(getComputedStyle(document.body).fontSize);
                const newSize = currentSize + (direction * 2);
                document.body.style.fontSize = newSize + 'px';
            }
            
            // High contrast toggle
            contrastToggle.addEventListener('click', function() {
                document.body.classList.toggle('high-contrast');
                if (document.body.classList.contains('high-contrast')) {
                    contrastToggle.textContent = 'Normal Contrast';
                } else {
                    contrastToggle.textContent = 'High Contrast';
                }
            });
            
            // Dark/Light mode toggle
            themeToggle.addEventListener('click', function() {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', newTheme);
                themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
                localStorage.setItem('autoflow-theme', newTheme);
            });
            
            // Load saved theme
            const savedTheme = localStorage.getItem('autoflow-theme') || 'light';
            document.documentElement.setAttribute('data-theme', savedTheme);
            themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

            // Drag and drop functionality for automation builder
            const actionItems = document.querySelectorAll('.action-item');
            const workflowArea = document.getElementById('workflow-area');
            const workflowSteps = document.getElementById('workflow-steps');
            const runAutomationBtn = document.getElementById('run-automation');
            const saveWorkflowBtn = document.getElementById('save-workflow');
            const clearWorkflowBtn = document.getElementById('clear-workflow');
            const importWorkflowBtn = document.getElementById('import-workflow');
            const importFileInput = document.getElementById('import-file');
            
            // Set up drag events for action items
            actionItems.forEach(item => {
                item.addEventListener('dragstart', function(e) {
                    e.dataTransfer.setData('text/plain', e.target.dataset.action);
                });
                
                // Keyboard accessibility for action items
                item.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        addActionToWorkflow(e.target.dataset.action);
                    }
                });
            });
            
            // Set up drop events for workflow area
            workflowArea.addEventListener('dragover', function(e) {
                e.preventDefault();
                workflowArea.style.borderColor = 'var(--primary)';
                workflowArea.style.backgroundColor = 'var(--gray-light)';
            });
            
            workflowArea.addEventListener('dragleave', function() {
                workflowArea.style.borderColor = 'var(--gray)';
                workflowArea.style.backgroundColor = '';
            });
            
            workflowArea.addEventListener('drop', function(e) {
                e.preventDefault();
                workflowArea.style.borderColor = 'var(--gray)';
                workflowArea.style.backgroundColor = '';
                
                const actionType = e.dataTransfer.getData('text/plain');
                addActionToWorkflow(actionType);
            });
            
            // Function to add action to workflow
            function addActionToWorkflow(actionType) {
                const action = {
                    id: Date.now(),
                    type: actionType,
                    name: getActionName(actionType),
                    data: getDefaultDataForAction(actionType)
                };
                
                workflowEngine.currentWorkflow.push(action);
                updateWorkflowDisplay();
            }
            
            // Function to get display name for action
            function getActionName(actionType) {
                const actionNames = {
                    'fill-form': 'Fill Form',
                    'click-button': 'Click Button',
                    'send-notification': 'Send Notification',
                    'extract-data': 'Extract Data',
                    'schedule-task': 'Schedule Task'
                };
                
                return actionNames[actionType] || 'Unknown Action';
            }
            
            // Function to get default data for an action
            function getDefaultDataForAction(actionType) {
                const defaultData = {
                    'fill-form': { fields: [] },
                    'click-button': { selector: '' },
                    'send-notification': { message: 'Notification from AutoFlow' },
                    'extract-data': { selector: '', storage: 'variable' },
                    'schedule-task': { time: '09:00', repeat: 'daily' }
                };
                
                return defaultData[actionType] || {};
            }
            
            // Function to update workflow display
            function updateWorkflowDisplay() {
                workflowSteps.innerHTML = '';
                
                if (workflowEngine.currentWorkflow.length === 0) {
                    workflowArea.style.display = 'flex';
                    return;
                }
                
                workflowArea.style.display = 'none';
                
                workflowEngine.currentWorkflow.forEach((action, index) => {
                    const stepElement = document.createElement('div');
                    stepElement.className = 'workflow-step';
                    stepElement.setAttribute('data-step-id', action.id);
                    stepElement.innerHTML = `
                        <div>
                            <h4>${action.name}</h4>
                            <p>Step ${index + 1}</p>
                        </div>
                        <div class="step-actions">
                            <button class="btn btn-secondary edit-step" data-id="${action.id}">Edit</button>
                            <button class="btn btn-secondary remove-step" data-id="${action.id}">Remove</button>
                        </div>
                    `;
                    workflowSteps.appendChild(stepElement);
                });
                
                // Add event listeners to remove buttons
                document.querySelectorAll('.remove-step').forEach(button => {
                    button.addEventListener('click', function() {
                        const actionId = parseInt(this.dataset.id);
                        workflowEngine.currentWorkflow = workflowEngine.currentWorkflow.filter(action => action.id !== actionId);
                        updateWorkflowDisplay();
                    });
                });
                
                // Add event listeners to edit buttons
                document.querySelectorAll('.edit-step').forEach(button => {
                    button.addEventListener('click', function() {
                        const actionId = parseInt(this.dataset.id);
                        const action = workflowEngine.currentWorkflow.find(a => a.id === actionId);
                        if (action) {
                            editAction(action);
                        }
                    });
                });
            }
            
            // Function to edit an action (simplified for this example)
            function editAction(action) {
                const newName = prompt('Edit action name:', action.name);
                if (newName) {
                    action.name = newName;
                    updateWorkflowDisplay();
                }
            }
            
            // Run automation button
            runAutomationBtn.addEventListener('click', function() {
                if (workflowEngine.currentWorkflow.length === 0) {
                    alert('Please add at least one action to your workflow.');
                    return;
                }
                
                // Request notification permission if needed
                if ('Notification' in window && Notification.permission === 'default') {
                    Notification.requestPermission();
                }
                
                // Execute the workflow
                workflowEngine.executeWorkflow(workflowEngine.currentWorkflow);
            });
            
            // Clear workflow button
            clearWorkflowBtn.addEventListener('click', function() {
                if (confirm('Are you sure you want to clear the current workflow?')) {
                    workflowEngine.currentWorkflow = [];
                    updateWorkflowDisplay();
                }
            });
            
            // Save workflow button and modal
            const saveModal = document.getElementById('save-modal');
            const closeSaveModal = document.getElementById('close-save-modal');
            const cancelSave = document.getElementById('cancel-save');
            const saveWorkflowForm = document.getElementById('save-workflow-form');
            
            saveWorkflowBtn.addEventListener('click', function() {
                if (workflowEngine.currentWorkflow.length === 0) {
                    alert('Please add at least one action to your workflow before saving.');
                    return;
                }
                
                // If we're editing an existing workflow, pre-fill the form
                if (currentWorkflowId) {
                    const workflow = workflowEngine.getWorkflow(currentWorkflowId);
                    if (workflow) {
                        document.getElementById('workflow-name').value = workflow.name;
                        document.getElementById('workflow-description').value = workflow.description || '';
                    }
                }
                
                saveModal.style.display = 'flex';
            });
            
            closeSaveModal.addEventListener('click', function() {
                saveModal.style.display = 'none';
            });
            
            cancelSave.addEventListener('click', function() {
                saveModal.style.display = 'none';
            });
            
            saveWorkflowForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const name = document.getElementById('workflow-name').value;
                const description = document.getElementById('workflow-description').value;
                
                if (currentWorkflowId) {
                    // Update existing workflow
                    workflowEngine.updateWorkflow(
                        currentWorkflowId, 
                        name, 
                        description, 
                        workflowEngine.currentWorkflow
                    );
                } else {
                    // Create new workflow
                    workflowEngine.addWorkflow(name, description, workflowEngine.currentWorkflow);
                }
                
                saveModal.style.display = 'none';
                loadWorkflowsList();
                alert('Workflow saved successfully!');
            });
            
            // Import workflow functionality
            importWorkflowBtn.addEventListener('click', function() {
                importFileInput.click();
            });
            
            importFileInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        const workflow = workflowEngine.importWorkflow(event.target.result);
                        if (workflow) {
                            loadWorkflowsList();
                            alert('Workflow imported successfully!');
                        }
                    };
                    reader.readAsText(file);
                }
                
                // Reset the file input
                e.target.value = '';
            });
            
            // Load and display workflows
            function loadWorkflowsList() {
                const workflowList = document.getElementById('workflow-list');
                workflowList.innerHTML = '';
                
                if (workflowEngine.workflows.length === 0) {
                    workflowList.innerHTML = '<p>No workflows saved yet. Create your first workflow using the builder above!</p>';
                    return;
                }
                
                workflowEngine.workflows.forEach(workflow => {
                    const workflowCard = document.createElement('div');
                    workflowCard.className = 'workflow-card card';
                    workflowCard.innerHTML = `
                        <h3>${workflow.name}</h3>
                        <p>${workflow.description || 'No description'}</p>
                        <p><small>Created: ${new Date(workflow.created).toLocaleDateString()}</small></p>
                        <div class="workflow-actions">
                            <button class="btn btn-primary load-workflow" data-id="${workflow.id}">Load</button>
                            <button class="btn btn-secondary export-workflow" data-id="${workflow.id}">Export</button>
                            <button class="btn btn-secondary delete-workflow" data-id="${workflow.id}">Delete</button>
                        </div>
                    `;
                    workflowList.appendChild(workflowCard);
                });
                
                // Add event listeners to workflow actions
                document.querySelectorAll('.load-workflow').forEach(button => {
                    button.addEventListener('click', function() {
                        const workflowId = this.dataset.id;
                        const workflow = workflowEngine.getWorkflow(workflowId);
                        if (workflow) {
                            workflowEngine.currentWorkflow = [...workflow.steps];
                            currentWorkflowId = workflowId;
                            updateWorkflowDisplay();
                            // Scroll to builder
                            document.getElementById('builder').scrollIntoView({ behavior: 'smooth' });
                            alert('Workflow loaded!');
                        }
                    });
                });
                
                document.querySelectorAll('.export-workflow').forEach(button => {
                    button.addEventListener('click', function() {
                        const workflowId = this.dataset.id;
                        const workflow = workflowEngine.getWorkflow(workflowId);
                        if (workflow) {
                            const exportModal = document.getElementById('export-modal');
                            const exportData = document.getElementById('export-data');
                            const closeExportModal = document.getElementById('close-export-modal');
                            const closeExport = document.getElementById('close-export');
                            const copyExport = document.getElementById('copy-export');
                            
                            exportData.value = workflowEngine.exportWorkflow(workflow);
                            exportModal.style.display = 'flex';
                            
                            closeExportModal.addEventListener('click', function() {
                                exportModal.style.display = 'none';
                            });
                            
                            closeExport.addEventListener('click', function() {
                                exportModal.style.display = 'none';
                            });
                            
                            copyExport.addEventListener('click', function() {
                                exportData.select();
                                document.execCommand('copy');
                                alert('Workflow copied to clipboard!');
                            });
                        }
                    });
                });
                
                document.querySelectorAll('.delete-workflow').forEach(button => {
                    button.addEventListener('click', function() {
                        const workflowId = this.dataset.id;
                        if (confirm('Are you sure you want to delete this workflow?')) {
                            workflowEngine.deleteWorkflow(workflowId);
                            loadWorkflowsList();
                        }
                    });
                });
            }
            
            // Initialize the workflows list
            loadWorkflowsList();
            
            // Close modals when clicking outside
            window.addEventListener('click', function(e) {
                if (e.target.classList.contains('modal')) {
                    e.target.style.display = 'none';
                }
            });
        });