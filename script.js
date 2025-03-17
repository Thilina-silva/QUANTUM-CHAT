// DOM Elements
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const canvas = document.getElementById('quantumCanvas');
const ctx = canvas.getContext('2d');
const themeSelector = document.getElementById('quantumTheme');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

// API Configuration
const COHERE_API_KEY = 'RvwURyicgwE1jCRvMc8qVLTdf0x0G2C3EO8v6H7I';
const API_URL = 'https://api.cohere.ai/v1/generate';

// Chat History
let chatHistory = [];
let particles = [];
let animationFrameId;

// Wait for the intro animation to complete
document.addEventListener('DOMContentLoaded', () => {
    const intro = document.getElementById('intro');
    const mainContent = document.getElementById('mainContent');

    // After intro animation completes
    setTimeout(() => {
        intro.style.display = 'none';
        mainContent.classList.remove('hidden');
    }, 3500);

    // Initialize the rest of the app
    initializeApp();
});

function initializeApp() {
    // Theme handling
    const savedTheme = localStorage.getItem('quantumTheme') || 'entanglement';
    themeSelector.value = savedTheme;
    document.body.setAttribute('data-theme', savedTheme);

    // Initialize particle system after a short delay
    setTimeout(() => {
        initParticles();
        updateParticleEffect(savedTheme);
        animate();
    }, 100);

    // Start ping service
    startPingService();
}

// Event Listeners
themeSelector.addEventListener('change', (e) => {
    const theme = e.target.value;
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('quantumTheme', theme);
    updateParticleEffect(theme);
});

// Particle system
class Particle {
    constructor(x, y, theme) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.theme = theme;
        this.entangled = Math.random() > 0.7;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Bounce off edges
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;

        // Theme-specific behavior
        switch (this.theme) {
            case 'entanglement':
                if (this.entangled) {
                    this.x += Math.sin(Date.now() * 0.001) * 2;
                    this.y += Math.cos(Date.now() * 0.001) * 2;
                }
                break;
            case 'superposition':
                if (Math.random() < 0.01) {
                    this.x = Math.random() * canvas.width;
                    this.y = Math.random() * canvas.height;
                }
                break;
            case 'tunneling':
                if (Math.random() < 0.005) {
                    this.x = Math.random() * canvas.width;
                    this.y = Math.random() * canvas.height;
                }
                break;
            case 'wave':
                this.x += Math.sin(Date.now() * 0.001 + this.y * 0.01) * 1;
                break;
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.entangled ? getComputedStyle(document.body).getPropertyValue('--secondary-color') : 
                                       getComputedStyle(document.body).getPropertyValue('--primary-color');
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    for (let i = 0; i < 100; i++) {
        particles.push(new Particle(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            themeSelector.value
        ));
    }
}

function updateParticleEffect(theme) {
    particles.forEach(particle => {
        particle.theme = theme;
    });
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    animationFrameId = requestAnimationFrame(animate);
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Initialize particle system
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Quantum Mode Toggle
const quantumModeToggle = document.getElementById('quantumMode');
quantumModeToggle.addEventListener('change', () => {
    document.body.classList.toggle('quantum-mode-active', quantumModeToggle.checked);
    localStorage.setItem('quantumMode', quantumModeToggle.checked);
});

// Load saved quantum mode preference
const savedQuantumMode = localStorage.getItem('quantumMode') === 'true';
quantumModeToggle.checked = savedQuantumMode;
if (savedQuantumMode) {
    document.body.classList.add('quantum-mode-active');
}

// Reaction Menu
const reactionMenu = document.getElementById('reactionMenu');
let activeMessage = null;

// Search functionality
let searchTimeout;
const searchDelay = 300; // ms

searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();
    
    if (query.length < 2) {
        searchResults.classList.remove('active');
        return;
    }

    searchTimeout = setTimeout(() => {
        performQuantumSearch(query);
    }, searchDelay);
});

function performQuantumSearch(query) {
    const results = [];
    const messages = chatMessages.querySelectorAll('.message');
    
    messages.forEach((message, index) => {
        const content = message.querySelector('.message-content').textContent;
        const role = message.classList.contains('user') ? 'User' : 'AI';
        
        if (content.toLowerCase().includes(query.toLowerCase())) {
            results.push({
                content,
                role,
                index,
                timestamp: new Date().toLocaleTimeString()
            });
        }
    });

    displaySearchResults(results, query);
}

function displaySearchResults(results, query) {
    searchResults.innerHTML = '';
    
    if (results.length === 0) {
        searchResults.innerHTML = `
            <div class="search-result-item">
                <div class="search-result-content">No quantum matches found</div>
            </div>
        `;
    } else {
        results.forEach(result => {
            const highlightedContent = highlightSearchQuery(result.content, query);
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            resultItem.innerHTML = `
                <div class="search-result-content">${highlightedContent}</div>
                <div class="search-result-meta">${result.role} • ${result.timestamp}</div>
            `;
            
            resultItem.addEventListener('click', () => {
                scrollToMessage(result.index);
                searchResults.classList.remove('active');
                searchInput.value = '';
            });
            
            searchResults.appendChild(resultItem);
        });
    }
    
    searchResults.classList.add('active');
}

function highlightSearchQuery(content, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return content.replace(regex, '<span class="search-highlight">$1</span>');
}

function scrollToMessage(index) {
    const messages = chatMessages.querySelectorAll('.message');
    if (messages[index]) {
        messages[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Add quantum highlight effect
        messages[index].classList.add('quantum-highlight');
        setTimeout(() => {
            messages[index].classList.remove('quantum-highlight');
        }, 2000);
    }
}

// Close search results when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
        searchResults.classList.remove('active');
    }
});

// Event Listeners
sendButton.addEventListener('click', handleSendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
    }
});

// Auto-resize textarea
userInput.addEventListener('input', () => {
    userInput.style.height = 'auto';
    userInput.style.height = userInput.scrollHeight + 'px';
});

// Show reaction menu on message right-click
document.addEventListener('contextmenu', (e) => {
    const messageContent = e.target.closest('.message-content');
    if (messageContent) {
        e.preventDefault();
        activeMessage = messageContent;
        showReactionMenu(e.clientX, e.clientY);
    }
});

// Hide reaction menu on click outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.reaction-menu') && !e.target.closest('.message-content')) {
        hideReactionMenu();
    }
});

function showReactionMenu(x, y) {
    reactionMenu.style.display = 'flex';
    reactionMenu.style.left = `${x}px`;
    reactionMenu.style.top = `${y}px`;
}

function hideReactionMenu() {
    reactionMenu.style.display = 'none';
    activeMessage = null;
}

// Handle reaction clicks
reactionMenu.addEventListener('click', (e) => {
    const reactionBtn = e.target.closest('.reaction-btn');
    if (reactionBtn && activeMessage) {
        const reaction = reactionBtn.dataset.reaction;
        addReaction(activeMessage, reaction);
        hideReactionMenu();
    }
});

function addReaction(messageContent, reaction) {
    let reactionsContainer = messageContent.querySelector('.message-reactions');
    if (!reactionsContainer) {
        reactionsContainer = document.createElement('div');
        reactionsContainer.className = 'message-reactions';
        messageContent.appendChild(reactionsContainer);
    }

    const reactionBadge = document.createElement('div');
    reactionBadge.className = 'reaction-badge';
    reactionBadge.innerHTML = `${getReactionEmoji(reaction)} ${reaction}`;
    reactionsContainer.appendChild(reactionBadge);
}

function getReactionEmoji(reaction) {
    const emojis = {
        'superposition': '⚛',
        'entangled': '🔗',
        'collapsed': '📊',
        'wave': '🌊'
    };
    return emojis[reaction] || '⚛';
}

// Code highlighting
function highlightCode(messageContent) {
    const codeBlocks = messageContent.querySelectorAll('pre code');
    codeBlocks.forEach(block => {
        Prism.highlightElement(block);
    });
}

// Functions
function showThinkingAnimation() {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ai thinking';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    const dots = document.createElement('div');
    dots.className = 'thinking-dots';
    dots.innerHTML = '<span></span><span></span><span></span>';
    
    messageContent.appendChild(dots);
    messageDiv.appendChild(messageContent);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return messageDiv;
}

function removeThinkingAnimation(messageDiv) {
    if (messageDiv && messageDiv.parentNode) {
        messageDiv.parentNode.removeChild(messageDiv);
    }
}

// Voice Input/Output
const voiceButton = document.getElementById('voiceButton');
let recognition = null;
let isRecording = false;

// Initialize speech recognition
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript;
        userInput.style.height = 'auto';
        userInput.style.height = userInput.scrollHeight + 'px';
    };

    recognition.onend = () => {
        isRecording = false;
        voiceButton.classList.remove('recording');
        voiceButton.querySelector('.voice-icon').textContent = '🎤';
    };
}

// Voice button click handler
voiceButton.addEventListener('click', () => {
    if (!recognition) {
        alert('Speech recognition is not supported in your browser.');
        return;
    }

    if (!isRecording) {
        recognition.start();
        isRecording = true;
        voiceButton.classList.add('recording');
        voiceButton.querySelector('.voice-icon').textContent = '⏹';
    } else {
        recognition.stop();
    }
});

// Text-to-Speech for AI responses
function speakResponse(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Add quantum-themed voice effects
    if (quantumModeToggle.checked) {
        utterance.rate = 0.9;
        utterance.pitch = 1.2;
    }
    
    window.speechSynthesis.speak(utterance);
}

// Modify handleSendMessage to include voice output
async function handleSendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // Disable input and button while processing
    userInput.disabled = true;
    sendButton.disabled = true;
    voiceButton.disabled = true;
    sendButton.textContent = 'Sending...';

    // Add user message to chat
    addMessageToChat('user', message);
    userInput.value = '';
    userInput.style.height = 'auto';

    // Show thinking animation
    const thinkingMessage = showThinkingAnimation();

    try {
        // Get AI response
        const response = await getAIResponse(message);
        removeThinkingAnimation(thinkingMessage);
        addMessageToChat('ai', response);
        
        // Speak the response
        speakResponse(response);
        
        sendButton.textContent = 'Send';
        userInput.disabled = false;
        voiceButton.disabled = false;
        userInput.focus();
    } catch (error) {
        console.error('Error:', error);
        removeThinkingAnimation(thinkingMessage);
        addMessageToChat('ai', 'Sorry, I encountered an error. Please try again.');
        sendButton.textContent = 'Send';
        userInput.disabled = false;
        voiceButton.disabled = false;
        userInput.focus();
    }
}

// Quantum Code Visualization
function createQuantumCodeVisualization(code, container) {
    const canvas = document.createElement('canvas');
    canvas.className = 'code-visualization';
    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    const particles = [];
    const codeLines = code.split('\n');
    
    class CodeParticle {
        constructor(x, y, lineIndex) {
            this.x = x;
            this.y = y;
            this.lineIndex = lineIndex;
            this.size = Math.random() * 2 + 1;
            this.speedX = Math.random() * 2 - 1;
            this.speedY = Math.random() * 2 - 1;
            this.color = getComputedStyle(document.body).getPropertyValue('--primary-color');
            this.entangled = Math.random() > 0.7;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Bounce off edges
            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;

            // Entanglement effect
            if (this.entangled) {
                this.x += Math.sin(Date.now() * 0.001) * 2;
                this.y += Math.cos(Date.now() * 0.001) * 2;
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.entangled ? 
                getComputedStyle(document.body).getPropertyValue('--secondary-color') : 
                this.color;
            ctx.fill();
        }
    }

    function initParticles() {
        const lineHeight = canvas.height / codeLines.length;
        codeLines.forEach((line, index) => {
            const y = (index + 0.5) * lineHeight;
            const numParticles = Math.min(line.length, 10);
            for (let i = 0; i < numParticles; i++) {
                const x = (canvas.width / (numParticles + 1)) * (i + 1);
                particles.push(new CodeParticle(x, y, index));
            }
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        requestAnimationFrame(animate);
    }

    function resizeCanvas() {
        canvas.width = container.clientWidth;
        canvas.height = Math.max(100, codeLines.length * 20);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    initParticles();
    animate();
}

// Code Execution
const SUPPORTED_LANGUAGES = {
    'javascript': 'JavaScript',
    'python': 'Python',
    'html': 'HTML',
    'css': 'CSS'
};

function createCodeExecutionButton(codeContainer, language) {
    const runButton = document.createElement('button');
    runButton.className = 'run-code-btn';
    runButton.innerHTML = '⚡ Run Code';
    runButton.title = `Run ${SUPPORTED_LANGUAGES[language] || 'code'}`;
    
    runButton.addEventListener('click', async () => {
        if (runButton.classList.contains('running')) return;
        
        const code = codeContainer.querySelector('code').textContent;
        const outputContainer = document.createElement('div');
        outputContainer.className = 'code-output';
        
        // Add quantum loading animation
        outputContainer.innerHTML = `
            <div class="quantum-loader">
                <div class="quantum-spinner"></div>
                <div class="quantum-text">Executing in quantum space...</div>
            </div>
        `;
        
        codeContainer.appendChild(outputContainer);
        runButton.classList.add('running');
        
        try {
            const result = await executeCode(code, language);
            
            // Replace loading animation with result
            outputContainer.innerHTML = `
                <div class="output-header">Output:</div>
                <pre class="output-content">${result}</pre>
            `;
            
            // Add quantum success effect
            outputContainer.classList.add('success');
        } catch (error) {
            outputContainer.innerHTML = `
                <div class="output-header error">Error:</div>
                <pre class="output-content error">${error.message}</pre>
            `;
            outputContainer.classList.add('error');
        } finally {
            runButton.classList.remove('running');
        }
    });
    
    return runButton;
}

async function executeCode(code, language) {
    // This is a mock implementation. In a real application, you would:
    // 1. Send the code to a secure backend
    // 2. Execute it in a sandboxed environment
    // 3. Return the results
    
    // For demonstration, we'll simulate execution with a delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    switch (language) {
        case 'javascript':
            try {
                // Create a safe execution environment
                const result = new Function(code)();
                return result !== undefined ? result.toString() : 'Code executed successfully';
            } catch (error) {
                throw new Error(error.message);
            }
        case 'python':
            return 'Python execution would be handled by a backend service';
        case 'html':
            return 'HTML preview would be shown in a separate window';
        case 'css':
            return 'CSS would be applied to a preview element';
        default:
            throw new Error('Unsupported language');
    }
}

// Modify the addMessageToChat function to include the run button
function addMessageToChat(sender, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    // Create a text container for the actual message content
    const textContainer = document.createElement('div');
    textContainer.className = 'message-text';
    
    // Check if content contains code blocks
    if (content.includes('```')) {
        // Process markdown-style code blocks
        content = content.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            const codeContainer = document.createElement('div');
            codeContainer.className = 'code-container';
            
            const pre = document.createElement('pre');
            pre.innerHTML = `<code class="language-${lang || 'plaintext'}">${code.trim()}</code>`;
            codeContainer.appendChild(pre);
            
            // Add visualization toggle button
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'visualization-toggle';
            toggleBtn.innerHTML = '⚛ Visualize';
            toggleBtn.onclick = () => {
                if (!codeContainer.querySelector('.code-visualization')) {
                    createQuantumCodeVisualization(code.trim(), codeContainer);
                    toggleBtn.innerHTML = '⚛ Hide Visualization';
                } else {
                    codeContainer.querySelector('.code-visualization').remove();
                    toggleBtn.innerHTML = '⚛ Visualize';
                }
            };
            codeContainer.appendChild(toggleBtn);
            
            // Add run button for supported languages
            if (SUPPORTED_LANGUAGES[lang]) {
                const runBtn = createCodeExecutionButton(codeContainer, lang);
                codeContainer.appendChild(runBtn);
            }
            
            return codeContainer.outerHTML;
        });
    }
    
    textContainer.innerHTML = content;
    
    // Highlight any code blocks
    highlightCode(textContainer);
    
    // Add message actions for user messages
    if (sender === 'user') {
        const messageActions = document.createElement('div');
        messageActions.className = 'message-actions';
        messageActions.innerHTML = `
            <button class="message-action-btn resend-message" title="Resend message">
                <i>↺</i> Resend
            </button>
        `;
        messageContent.appendChild(messageActions);

        // Add event listener for resend
        const resendBtn = messageActions.querySelector('.resend-message');
        resendBtn.addEventListener('click', () => resendMessage(content));
    }
    
    // Add the text container to message content
    messageContent.appendChild(textContainer);
    
    // Add message content to message div
    messageDiv.appendChild(messageContent);
    
    // Add to chat messages
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Add to chat history
    chatHistory.push({ role: sender === 'user' ? 'user' : 'assistant', content });
}

function resendMessage(content) {
    // Add the message back to the input
    userInput.value = content;
    userInput.style.height = 'auto';
    userInput.style.height = userInput.scrollHeight + 'px';
    
    // Focus the input
    userInput.focus();
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function getAIResponse(message) {
    try {
        const isQuantumMode = quantumModeToggle.checked;
        const prompt = isQuantumMode 
            ? `[QUANTUM MODE] You are a quantum AI assistant. Respond in a more abstract, philosophical, and quantum-themed way. Consider multiple possibilities and quantum states in your response. User: ${message}`
            : `User: ${message}`;

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${COHERE_API_KEY}`
            },
            body: JSON.stringify({
                model: 'command',
                prompt: prompt,
                max_tokens: 300,
                temperature: isQuantumMode ? 0.8 : 0.7,
                k: 0,
                stop_sequences: ["User:"],
                return_likelihoods: "NONE"
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data.generations[0].text.trim();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Initialize chat with welcome message
addMessageToChat('ai', 'Hello! I\'m your AI assistant. How can I help you today?');

// Ping mechanism to keep the service active
function startPingService() {
    const pingInterval = 14 * 60 * 1000; // Ping every 14 minutes
    const pingUrl = '/ping';

    async function ping() {
        try {
            const response = await fetch(pingUrl);
            const data = await response.json();
            console.log('Service ping successful:', data.timestamp);
        } catch (error) {
            console.error('Ping failed:', error);
        }
    }

    // Initial ping
    ping();

    // Set up interval for regular pings
    setInterval(ping, pingInterval);
} 