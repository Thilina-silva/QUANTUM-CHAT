// DOM Elements
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const voiceButton = document.getElementById('voiceButton');
const canvas = document.getElementById('quantumCanvas');
const ctx = canvas.getContext('2d');

// Validate required DOM elements
if (!chatMessages || !userInput || !sendButton || !canvas || !ctx) {
    console.error('Required DOM elements not found. Check your HTML structure.');
}

// Search Elements
const searchInput = document.createElement('input');
searchInput.type = 'text';
searchInput.id = 'searchInput';
searchInput.placeholder = 'Search messages...';
searchInput.className = 'search-input';

const searchResults = document.createElement('div');
searchResults.id = 'searchResults';
searchResults.className = 'search-results';

// Create search container and append elements
const searchContainer = document.createElement('div');
searchContainer.className = 'search-container';
searchContainer.appendChild(searchInput);
searchContainer.appendChild(searchResults);

// Reaction Menu Elements
const reactionMenu = document.createElement('div');
reactionMenu.className = 'reaction-menu';
reactionMenu.innerHTML = `
    <button class="reaction-btn" data-reaction="superposition">⚛ Superposition</button>
    <button class="reaction-btn" data-reaction="entangled">🔗 Entangled</button>
    <button class="reaction-btn" data-reaction="collapsed">📊 Collapsed</button>
    <button class="reaction-btn" data-reaction="wave">🌊 Wave</button>
`;
document.body.appendChild(reactionMenu);

let activeMessage = null;
let isProcessingMessage = false; // Flag to prevent multiple message sends

// API Configuration
const COHERE_API_KEY = 'RvwURyicgwE1jCRvMc8qVLTdf0x0G2C3EO8v6H7I';
const API_URL = 'https://api.cohere.ai/v1/generate';

// Chat History
let chatHistory = [];
let particles = [];
let animationFrameId;

// AMOS Knowledge Base Data
const amosKnowledge = {
    company: {
        name: "SpecTec",
        mission: "To provide innovative solutions for maritime asset management.",
        values: [
            "Integrity",
            "Innovation",
            "Customer Focus",
            "Sustainability"
        ],
        overview: "SpecTec is a leading provider of asset management solutions for the maritime industry, dedicated to enhancing operational efficiency and safety."
    },
    general: {
        introduction: `AMOS (Asset Management Operating System) is SpecTec's flagship solution for maritime asset management. It provides comprehensive tools for maintenance, procurement, inventory, and QHSE management.`,
        keyFeatures: [
            'Integrated Asset Management',
            'Maintenance Planning',
            'Procurement Management',
            'Inventory Control',
            'Quality & Safety Management'
        ],
        modules: {
            maintenance: 'Complete maintenance management system',
            procurement: 'End-to-end procurement cycle management',
            inventory: 'Stock control and warehouse management',
            qhse: 'Quality, Health, Safety, and Environmental management'
        }
    },
    maintenance: {
        overview: 'The Maintenance module helps manage all aspects of equipment maintenance.',
        features: [
            'Work Order Management',
            'Preventive Maintenance',
            'Condition Monitoring',
            'Job Safety Analysis'
        ],
        commonTasks: [
            'Creating work orders',
            'Scheduling maintenance',
            'Recording equipment readings',
            'Managing spare parts'
        ]
    },
    procurement: {
        overview: 'The Procurement module streamlines the purchasing process.',
        features: [
            'Purchase Requisitions',
            'Purchase Orders',
            'Supplier Management',
            'Cost Tracking'
        ],
        workflows: [
            'Requisition to Purchase',
            'Supplier Evaluation',
            'Budget Management',
            'Order Tracking'
        ]
    },
    inventory: {
        overview: 'The Inventory module manages stock levels and warehouse operations.',
        features: [
            'Stock Management',
            'Warehouse Operations',
            'Parts Cataloging',
            'Inventory Tracking'
        ],
        processes: [
            'Stock Taking',
            'Goods Receipt',
            'Stock Transfers',
            'Minimum Stock Levels'
        ]
    },
    qhse: {
        overview: 'The QHSE module ensures compliance with quality and safety standards.',
        features: [
            'Document Control',
            'Audit Management',
            'Risk Assessment',
            'Incident Reporting'
        ],
        compliance: [
            'ISM Code',
            'ISO Standards',
            'Safety Procedures',
            'Environmental Regulations'
        ]
    }
};

// Wait for the intro animation to complete
document.addEventListener('DOMContentLoaded', () => {
    const intro = document.getElementById('intro');
    const mainContent = document.getElementById('mainContent');
    
    if (!intro || !mainContent) {
        console.error('Required intro elements not found.');
        return;
    }

    const header = document.createElement('header');
    
    // Add search container to header
    header.appendChild(searchContainer);
    mainContent.insertBefore(header, mainContent.firstChild);

    // After intro animation completes
    setTimeout(() => {
        intro.style.display = 'none';
        mainContent.classList.remove('hidden');
        resizeCanvas(); // Ensure canvas is properly sized after display
    }, 3500);

    // Initialize the rest of the app
    initializeApp();
    
    // Add welcome message
    addMessageToChat('ai', 'Hello! I\'m your AI assistant. How can I help you today?');
});

function initializeApp() {
    // Initialize particle system after a short delay
    setTimeout(() => {
        initParticles();
        animate();
    }, 100);

    // Start ping service
    startPingService();
}

// Particle system
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.color = '#00ffff';
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Bounce off edges
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    for (let i = 0; i < 100; i++) {
        particles.push(new Particle(
            Math.random() * canvas.width,
            Math.random() * canvas.height
        ));
    }
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

// Event Listeners
if (sendButton) {
    sendButton.addEventListener('click', () => {
        if (!isProcessingMessage) {
            handleSendMessage();
        }
    });
}

if (userInput) {
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey && !isProcessingMessage) {
            e.preventDefault();
            handleSendMessage();
        }
    });

    // Auto-resize textarea
    userInput.addEventListener('input', () => {
        userInput.style.height = 'auto';
        const newHeight = Math.min(userInput.scrollHeight, 200); // Max height of 200px
        userInput.style.height = newHeight + 'px';
    });
}

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
if (voiceButton) {
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
            if (userInput) {
                userInput.value = transcript;
                userInput.style.height = 'auto';
                userInput.style.height = userInput.scrollHeight + 'px';
            }
        };

        recognition.onend = () => {
            isRecording = false;
            voiceButton.classList.remove('recording');
            const voiceIcon = voiceButton.querySelector('.voice-icon');
            if (voiceIcon) {
                voiceIcon.textContent = '🎤';
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            isRecording = false;
            voiceButton.classList.remove('recording');
            const voiceIcon = voiceButton.querySelector('.voice-icon');
            if (voiceIcon) {
                voiceIcon.textContent = '🎤';
            }
            alert('Speech recognition error. Please try again.');
        };
    }

    voiceButton.addEventListener('click', () => {
        if (!recognition) {
            alert('Speech recognition is not supported in your browser.');
            return;
        }

        if (!isRecording) {
            recognition.start();
            isRecording = true;
            voiceButton.classList.add('recording');
            const voiceIcon = voiceButton.querySelector('.voice-icon');
            if (voiceIcon) {
                voiceIcon.textContent = '⏹';
            }
        } else {
            recognition.stop();
        }
    });
}

// Text-to-Speech for AI responses
function speakResponse(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
}

// Modify handleSendMessage to include voice output
async function handleSendMessage() {
    const message = userInput?.value.trim();
    if (!message || isProcessingMessage) return;

    isProcessingMessage = true;

    try {
        // Disable input and button while processing
        if (userInput) userInput.disabled = true;
        if (sendButton) {
            sendButton.disabled = true;
            sendButton.textContent = 'Sending...';
        }
        if (voiceButton) voiceButton.disabled = true;

        // Add user message to chat
        addMessageToChat('user', message);
        if (userInput) {
            userInput.value = '';
            userInput.style.height = 'auto';
        }

        // Show thinking animation
        const thinkingMessage = showThinkingAnimation();

        // Get AI response
        const response = await getAIResponse(message);
        removeThinkingAnimation(thinkingMessage);
        addMessageToChat('ai', response);
        
        // Speak the response if speech synthesis is available
        if (window.speechSynthesis) {
            speakResponse(response);
        }
    } catch (error) {
        console.error('Error:', error);
        removeThinkingAnimation(thinkingMessage);
        addMessageToChat('ai', 'Sorry, I encountered an error. Please try again.');
    } finally {
        if (sendButton) {
            sendButton.textContent = 'Send';
            sendButton.disabled = false;
        }
        if (userInput) {
            userInput.disabled = false;
            userInput.focus();
        }
        if (voiceButton) voiceButton.disabled = false;
        isProcessingMessage = false;
    }
}

function addMessageToChat(sender, content) {
    if (!chatMessages || !content) return;

    try {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        const textContainer = document.createElement('div');
        textContainer.className = 'message-text';
        textContainer.innerHTML = content;
        
        messageContent.appendChild(textContainer);
        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom with smooth animation
        chatMessages.scrollTo({
            top: chatMessages.scrollHeight,
            behavior: 'smooth'
        });
        
        // Add to chat history
        chatHistory.push({ role: sender === 'user' ? 'user' : 'assistant', content });
    } catch (error) {
        console.error('Error adding message to chat:', error);
    }
}

async function getAIResponse(message) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${COHERE_API_KEY}`
            },
            body: JSON.stringify({
                model: 'command',
                prompt: `User: ${message}`,
                max_tokens: 300,
                temperature: 0.7,
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

// Search functionality
if (searchInput) {
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
}

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

// Cleanup function for animations
function cleanup() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
}

// Add cleanup on page unload
window.addEventListener('unload', cleanup);

// Initialize topic navigation
document.addEventListener('DOMContentLoaded', () => {
    const topicButtons = document.querySelectorAll('.topic-btn');
    const helpCards = document.querySelectorAll('.help-card');
    
    // Handle topic button clicks
    topicButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active state
            topicButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Load topic content
            const topic = button.dataset.topic;
            loadTopicContent(topic);
        });
    });
    
    // Handle help card clicks
    helpCards.forEach(card => {
        card.addEventListener('click', () => {
            const topic = card.querySelector('h3').textContent.toLowerCase().replace(/\s+/g, ''); // Ensure topic matches the keys in amosKnowledge
            loadTopicContent(topic);
            
            // Update active button
            topicButtons.forEach(btn => {
                if (btn.dataset.topic === topic) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        });
    });
});

// Load topic-specific content
function loadTopicContent(topic) {
    const chatMessages = document.getElementById('chatMessages');
    const content = amosKnowledge[topic];
    
    if (!content) return;
    
    // Create message content
    const messageHTML = `
        <div class="message ai">
            <div class="message-content">
                <h3>${topic.charAt(0).toUpperCase() + topic.slice(1)} Module</h3>
                <p>${content.overview || content.introduction}</p>
                
                ${content.features ? `
                    <div class="amos-example">
                        <h4>Key Features</h4>
                        <ul>
                            ${content.features.map(feature => `<li>${feature}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                ${content.modules ? `
                    <div class="kb-categories">
                        ${Object.entries(content.modules).map(([key, value]) => `
                            <div class="kb-category" data-module="${key}">
                                <h4>${key.charAt(0).toUpperCase() + key.slice(1)}</h4>
                                <p>${value}</p>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    // Clear existing messages and set new content
    chatMessages.innerHTML = messageHTML;
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Handle user input
function handleUserQuery(query) {
    // Process user query and find relevant AMOS information
    const response = searchAmosKnowledge(query);
    
    // Add user message
    addMessageToChat('user', query);
    
    // Add AI response
    addMessageToChat('ai', response);
}

function searchAmosKnowledge(query) {
    // Implement intelligent search through AMOS knowledge base
    // This is a simplified example - you would want to implement more sophisticated search logic
    const searchTerms = query.toLowerCase().split(' ');
    let response = '';
    
    for (const [topic, content] of Object.entries(amosKnowledge)) {
        if (searchTerms.some(term => topic.includes(term))) {
            response = `
                <h3>${topic.charAt(0).toUpperCase() + topic.slice(1)}</h3>
                <p>${content.overview || content.introduction}</p>
                
                ${content.features ? `
                    <div class="amos-example">
                        <h4>Key Features</h4>
                        <ul>
                            ${content.features.map(feature => `<li>${feature}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            `;
            break;
        }
    }
    
    return response || 'I apologize, but I couldn\'t find specific information about that. Please try rephrasing your question or select a topic from the navigation above.';
}

// Update existing event listeners
sendButton.addEventListener('click', () => {
    const query = userInput.value.trim();
    if (query) {
        handleUserQuery(query);
        userInput.value = '';
    }
});

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendButton.click();
    }
}); 