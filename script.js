// Constants and configurations
const CONFIG = {
    API_URL: 'http://127.0.0.1:5000/predict_formation',
    DEBOUNCE_DELAY: 300,
    MIN_VALUES: {
        xG: 0,
        xGA: 0,
        Poss: 0,
        xA: 0,
        KP: 0,
        PPA: 0,
        PrgP: 0
    },
    MAX_VALUES: {
        xG: 10,
        xGA: 10,
        Poss: 100,
        xA: 10,
        KP: 100,
        PPA: 100,
        PrgP: 100
    }
};

// Utility functions
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const validateFormData = (formData) => {
    const errors = [];
    
    for (const [key, value] of Object.entries(formData)) {
        if (isNaN(value)) {
            errors.push(`Invalid value for ${key}`);
        }
        if (value < CONFIG.MIN_VALUES[key]) {
            errors.push(`${key} cannot be less than ${CONFIG.MIN_VALUES[key]}`);
        }
        if (value > CONFIG.MAX_VALUES[key]) {
            errors.push(`${key} cannot be more than ${CONFIG.MAX_VALUES[key]}`);
        }
    }
    
    return errors;
};

// Main form handling
class PredictionForm {
    constructor() {
        this.form = document.getElementById('predictionForm');
        this.resultDiv = document.getElementById('result');
        this.submitButton = this.form.querySelector('button[type="submit"]');
        this.originalButtonText = this.submitButton.innerHTML;
        
        this.setupEventListeners();
        this.setupInputValidation();
    }

    setupEventListeners() {
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleSubmit();
        });
    }

    setupInputValidation() {
        const inputs = this.form.querySelectorAll('input');
        const validateInput = debounce((input) => {
            const value = parseFloat(input.value);
            const fieldName = input.id;
            
            if (isNaN(value)) {
                this.showInputError(input, 'Please enter a valid number');
            } else if (value < CONFIG.MIN_VALUES[fieldName]) {
                this.showInputError(input, `Minimum value is ${CONFIG.MIN_VALUES[fieldName]}`);
            } else if (value > CONFIG.MAX_VALUES[fieldName]) {
                this.showInputError(input, `Maximum value is ${CONFIG.MAX_VALUES[fieldName]}`);
            } else {
                this.clearInputError(input);
            }
        }, CONFIG.DEBOUNCE_DELAY);

        inputs.forEach(input => {
            input.addEventListener('input', () => validateInput(input));
        });
    }

    showInputError(input, message) {
        const errorDiv = input.parentElement.querySelector('.error-message') || 
            this.createErrorElement();
        errorDiv.textContent = message;
        input.classList.add('border-red-500');
        input.parentElement.appendChild(errorDiv);
    }

    clearInputError(input) {
        const errorDiv = input.parentElement.querySelector('.error-message');
        if (errorDiv) errorDiv.remove();
        input.classList.remove('border-red-500');
    }

    createErrorElement() {
        const div = document.createElement('div');
        div.className = 'error-message text-red-500 text-sm mt-1';
        return div;
    }

    setLoading(isLoading) {
        this.submitButton.disabled = isLoading;
        this.submitButton.innerHTML = isLoading ? `
            <svg class="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
        ` : this.originalButtonText;
    }

    getFormData() {
        return {
            xG: parseFloat(document.getElementById('xG').value) || 0,
            xGA: parseFloat(document.getElementById('xGA').value) || 0,
            Poss: parseFloat(document.getElementById('possession').value) || 0,
            xA: parseFloat(document.getElementById('xA').value) || 0,
            KP: parseInt(document.getElementById('keyPasses').value) || 0,
            PPA: parseInt(document.getElementById('PPA').value) || 0,
            PrgP: parseInt(document.getElementById('PrgP').value) || 0
        };
    }

    async handleSubmit() {
        this.setLoading(true);
        
        try {
            const formData = this.getFormData();
            const errors = validateFormData(formData);
            
            if (errors.length > 0) {
                throw new Error(errors.join('\n'));
            }

            const response = await fetch(CONFIG.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch prediction from API');
            }

            const result = await response.json();
            this.showResult(result);
            
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.setLoading(false);
        }
    }

    showResult(result) {
        this.resultDiv.innerHTML = `
            <div class="bg-white rounded-lg shadow-lg p-6 mt-8 transform transition-all duration-500 opacity-0">
                <h3 class="text-xl font-bold text-gray-800 mb-4">Predicted Formation</h3>
                <p class="text-gray-600">${result.prediction}</p>
                <div class="mt-4 text-sm text-gray-500">
                    Prediction confidence: ${result.confidence || 'N/A'}%
                </div>
            </div>
        `;

        setTimeout(() => {
            this.resultDiv.querySelector('div').classList.remove('opacity-0');
        }, 100);
    }

    showError(message) {
        this.resultDiv.innerHTML = `
            <div class="bg-red-50 border-l-4 border-red-500 p-4 mt-8">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                        </svg>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm text-red-700">${message}</p>
                    </div>
                </div>
            </div>
        `;
    }
}

// Initialize the form handler
document.addEventListener('DOMContentLoaded', () => {
    new PredictionForm();
});