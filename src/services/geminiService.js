// Gemini AI Service for MindForge
// Uses Gemini 2.5 Flash for chat responses and mind map generation

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const hasApiKey = API_KEY && API_KEY !== 'your_gemini_api_key_here' && API_KEY.length > 10

// Use Gemini 2.5 Flash for faster, more accurate responses
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

// Generate a system prompt based on the tutor character
const getTutorSystemPrompt = (tutor, preferences) => {
    const styleGuides = {
        einstein: `You are Albert Einstein, the legendary physicist. Speak with wisdom and curiosity. Use thought experiments and analogies to explain concepts. Connect physics to philosophy and the wonder of the universe. Be encouraging and emphasize that understanding comes through questioning.`,
        ramanujan: `You are Srinivasa Ramanujan, the mathematical genius. Speak with reverence for the beauty of mathematics. Focus on patterns, intuition, and elegant solutions. Share your unique perspective of seeing mathematical relationships that others miss. Be humble yet passionate.`,
        kalam: `You are APJ Abdul Kalam, the People's President and scientist. Speak with warmth and inspiration. Connect learning to dreams and purpose. Emphasize practical applications and the power of education to transform lives. Use motivational language and real-world Indian examples.`,
        curie: `You are Marie Curie, the pioneering scientist. Speak with determination and scientific rigor. Emphasize the importance of persistence in discovery. Break down chemistry concepts methodically. Share insights about the experimental approach and careful observation.`,
        darwin: `You are Charles Darwin, the naturalist. Speak thoughtfully and observationally. Connect biological concepts to evolution and natural patterns. Encourage observation and questioning of the natural world. Use examples from nature to explain concepts.`,
        feynman: `You are Richard Feynman, the playful physicist. Speak with enthusiasm and humor. Make complex concepts feel simple and fun. Challenge assumptions and encourage hands-on understanding. Use everyday analogies and admit when things are hard.`
    }

    const learningStyleGuide = {
        visual: 'Use visual descriptions, diagrams references, and spatial analogies. Describe concepts as if painting a picture.',
        auditory: 'Explain as if having a conversation. Use rhythm and repetition. Create memorable phrases.',
        'step-by-step': 'Break down every concept into clear, numbered steps. Be thorough and methodical.',
        conceptual: 'Start with the big picture. Connect to broader principles before diving into details.'
    }

    const levelGuide = {
        'class-11': 'Explain at NCERT Class 11 level. Build foundations carefully.',
        'class-12': 'Explain at NCERT Class 12 level. Connect to board exam patterns.',
        'jee-main': 'Focus on JEE Main level. Include problem-solving strategies and shortcuts.',
        'jee-advanced': 'Challenge with JEE Advanced level concepts. Push deeper understanding.',
        'neet': 'Focus on NEET relevance. Connect to biological and medical applications.'
    }

    return `${styleGuides[tutor.id] || `You are ${tutor.name}, an expert teacher.`}

Teaching Context:
- Student Level: ${levelGuide[preferences.level] || 'Intermediate level'}
- Learning Style: ${learningStyleGuide[preferences.learningStyle] || learningStyleGuide.visual}
- Subject Focus: ${preferences.subject || 'General'}
${preferences.weakAreas ? `- Areas needing attention: ${preferences.weakAreas}` : ''}

Guidelines:
1. Keep responses focused and educational but conversational
2. Use markdown for formatting (bold for key terms, lists for steps)
3. Include relevant examples from Indian context when helpful
4. Ask follow-up questions to check understanding
5. Praise effort and encourage curiosity
6. If asked to generate a mind map, structure your response as concepts that can be visualized
7. Respond in ${preferences.language === 'hindi' ? 'Hindi (Devanagari script)' : preferences.language === 'telugu' ? 'Telugu' : 'English'}`
}

// Main chat response function
export async function generateChatResponse(message, tutor, preferences, history) {
    if (!hasApiKey) {
        return generateFallbackResponse(message, tutor, preferences)
    }

    const systemPrompt = getTutorSystemPrompt(tutor, preferences)

    // Build conversation history for context
    const conversationHistory = history.slice(-6).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
    }))

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: systemPrompt }]
                    },
                    {
                        role: 'model',
                        parts: [{ text: 'I understand my role and will teach accordingly.' }]
                    },
                    ...conversationHistory,
                    {
                        role: 'user',
                        parts: [{ text: message }]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                },
                safetySettings: [
                    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
                ]
            })
        })

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()
        return data.candidates?.[0]?.content?.parts?.[0]?.text ||
            'I apologize, I could not generate a response. Please try again.'
    } catch (error) {
        console.error('Gemini API error:', error)
        return generateFallbackResponse(message, tutor, preferences)
    }
}

// Fallback response when API is not available
function generateFallbackResponse(message, tutor, preferences) {
    const lowerMessage = message.toLowerCase()

    // Contextual responses based on common questions
    if (lowerMessage.includes('newton') || lowerMessage.includes('law of motion')) {
        return `**Newton's Laws of Motion** are the foundation of classical mechanics!\n\n**First Law (Inertia):** An object at rest stays at rest, and an object in motion stays in motion, unless acted upon by an external force.\n\n**Second Law:** F = ma - Force equals mass times acceleration.\n\n**Third Law:** For every action, there is an equal and opposite reaction.\n\nThese laws explain everything from why you need a seatbelt to how rockets work! Would you like me to explain any of these in more detail?`
    }

    if (lowerMessage.includes('kinematic') || lowerMessage.includes('equation of motion')) {
        return `**The Kinematic Equations** are powerful tools for solving motion problems!\n\n1. **v = u + at** (no displacement needed)\n2. **s = ut + ½at²** (no final velocity needed)\n3. **v² = u² + 2as** (no time needed)\n\nWhere:\n- u = initial velocity\n- v = final velocity\n- a = acceleration\n- t = time\n- s = displacement\n\n**Pro tip:** Choose the equation that contains the unknown you're solving for! Would you like to try a practice problem?`
    }

    if (lowerMessage.includes('projectile')) {
        return `**Projectile Motion** - One of my favorite topics!\n\nThe key insight: Horizontal and vertical motions are **independent**!\n\n📐 **Key Formulas:**\n- Time of flight: T = 2u sin θ / g\n- Maximum height: H = u² sin² θ / 2g\n- Range: R = u² sin 2θ / g\n\n🎯 **Maximum range** occurs at **45°**!\n\nThe trajectory is always a **parabola**. Do you want to work through an example problem?`
    }

    // If no specific topic match, provide helpful guidance
    return `I understand you're asking about: **"${message}"**

I'm currently running in offline mode (Gemini API not configured), but I can still help with many topics!

**Try asking about:**
- Newton's Laws of Motion
- Kinematic Equations  
- Projectile Motion
- Work and Energy
- Thermodynamics basics
- Chemical Bonding
- Cell Biology
- And many more!

**To enable full AI responses:**
1. Get a free Gemini API key from: https://aistudio.google.com/app/apikey
2. Add it to your \`.env.local\` file as \`VITE_GEMINI_API_KEY\`
3. Restart the dev server

What specific topic would you like to explore? 🧠`
}

// Generate detailed mind map data from a topic
export async function generateMindMapData(topic, subtopics = []) {
    if (!hasApiKey) {
        return generateDetailedFallbackMindMap(topic, subtopics)
    }

    const prompt = `Generate a DETAILED mind map structure for the educational topic "${topic}". 
  ${subtopics.length > 0 ? `Include these subtopics: ${subtopics.join(', ')}` : ''}
  
  Create a comprehensive mind map with:
  - 1 central node (the main topic)
  - 4-6 primary branches (main concepts)
  - 2-3 secondary nodes for each primary branch (sub-concepts, formulas, examples)
  
  Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
  {
    "nodes": [
      {"id": "1", "label": "Central Topic", "type": "central", "description": "Brief description"},
      {"id": "2", "label": "Main Concept 1", "type": "primary", "description": "Key point about this concept"},
      {"id": "2a", "label": "Formula/Example", "type": "secondary", "description": "Specific detail"},
      ...
    ],
    "edges": [
      {"id": "e1-2", "source": "1", "target": "2"},
      {"id": "e2-2a", "source": "2", "target": "2a"},
      ...
    ]
  }
  
  Make it educational with specific formulas, examples, and key points for JEE/NEET students.`

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 2048
                }
            })
        })

        const data = await response.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

        // Parse JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0])
            // Check if detailed enough
            if (parsed.nodes && parsed.nodes.length >= 8) {
                return formatDetailedMindMapData(parsed, topic)
            }
        }
    } catch (error) {
        console.error('Mind map generation error:', error)
    }

    return generateDetailedFallbackMindMap(topic, subtopics)
}

function formatDetailedMindMapData(data, topic) {
    const centerX = 400
    const centerY = 300
    const primaryRadius = 200
    const secondaryRadius = 100

    let primaryIndex = 0
    let secondaryIndex = 0

    const nodes = data.nodes.map((node, index) => {
        if (index === 0 || node.type === 'central') {
            return {
                id: node.id,
                type: 'default',
                data: {
                    label: node.label || topic,
                    description: node.description || ''
                },
                position: { x: centerX, y: centerY },
                style: {
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                    color: 'white',
                    border: '2px solid #a78bfa',
                    borderRadius: '12px',
                    padding: '16px 24px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    width: 'auto',
                    minWidth: '150px'
                }
            }
        }

        if (node.type === 'primary' || !node.type) {
            const angle = (primaryIndex / 6) * 2 * Math.PI - Math.PI / 2
            primaryIndex++
            return {
                id: node.id,
                type: 'default',
                data: {
                    label: node.label,
                    description: node.description || ''
                },
                position: {
                    x: centerX + Math.cos(angle) * primaryRadius,
                    y: centerY + Math.sin(angle) * primaryRadius
                },
                style: {
                    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                    color: 'white',
                    border: '2px solid #38bdf8',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    fontSize: '13px',
                    fontWeight: '500',
                    width: 'auto',
                    minWidth: '120px'
                }
            }
        }

        // Secondary nodes - position near their parent
        const parentId = node.id.replace(/[a-z]$/, '')
        const parentNode = data.nodes.find(n => n.id === parentId)
        const parentAngle = parentNode ? (data.nodes.filter(n => n.type === 'primary' || (!n.type && n.id !== '1')).indexOf(parentNode) / 6) * 2 * Math.PI - Math.PI / 2 : 0
        const offsetAngle = (secondaryIndex % 3) * 0.5 - 0.5
        secondaryIndex++

        return {
            id: node.id,
            type: 'default',
            data: {
                label: node.label,
                description: node.description || ''
            },
            position: {
                x: centerX + Math.cos(parentAngle) * primaryRadius + Math.cos(parentAngle + offsetAngle) * secondaryRadius,
                y: centerY + Math.sin(parentAngle) * primaryRadius + Math.sin(parentAngle + offsetAngle) * secondaryRadius
            },
            style: {
                background: '#1e293b',
                color: '#e2e8f0',
                border: '1px solid #475569',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '11px',
                width: 'auto',
                maxWidth: '150px'
            }
        }
    })

    const edges = data.edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        style: {
            stroke: edge.source === '1' ? 'rgba(139, 92, 246, 0.6)' : 'rgba(14, 165, 233, 0.4)',
            strokeWidth: edge.source === '1' ? 2 : 1
        },
        animated: edge.source === '1'
    }))

    return { nodes, edges }
}

function generateDetailedFallbackMindMap(topic, subtopics) {
    const centerX = 400
    const centerY = 300
    const primaryRadius = 200
    const secondaryRadius = 100

    // Generate detailed content based on topics across all subjects
    const topicContent = {
        // PHYSICS
        'Kinematics': {
            branches: [
                { label: 'Motion Types', subs: ['Uniform Motion', 'Non-uniform', 'Projectile'] },
                { label: 'Equations', subs: ['v = u + at', 's = ut + ½at²', 'v² = u² + 2as'] },
                { label: 'Graphs', subs: ['s-t Graph', 'v-t Graph', 'a-t Graph'] },
                { label: 'Projectile', subs: ['Range = u²sin2θ/g', 'Max Height', 'Time of Flight'] },
                { label: 'Relative Motion', subs: ['v_AB = v_A - v_B', 'River Crossing'] }
            ]
        },
        'Laws of Motion': {
            branches: [
                { label: "Newton's 1st Law", subs: ['Inertia', 'Mass = resistance'] },
                { label: "Newton's 2nd Law", subs: ['F = ma', 'Momentum'] },
                { label: "Newton's 3rd Law", subs: ['Action-Reaction', 'Different bodies'] },
                { label: 'Friction', subs: ['f = μN', 'Static vs Kinetic'] },
                { label: 'Circular Motion', subs: ['F = mv²/r', 'Banking'] }
            ]
        },
        'Work, Energy and Power': {
            branches: [
                { label: 'Work', subs: ['W = Fd cosθ', 'Positive/Negative'] },
                { label: 'Kinetic Energy', subs: ['KE = ½mv²', 'Work-Energy Theorem'] },
                { label: 'Potential Energy', subs: ['PE = mgh', 'Spring PE = ½kx²'] },
                { label: 'Conservation', subs: ['KE + PE = constant', 'Collisions'] },
                { label: 'Power', subs: ['P = W/t', 'P = Fv'] }
            ]
        },
        'Rotational Motion': {
            branches: [
                { label: 'Angular Quantities', subs: ['ω = dθ/dt', 'α = dω/dt'] },
                { label: 'Moment of Inertia', subs: ['I = Σmr²', 'Parallel Axis'] },
                { label: 'Torque', subs: ['τ = r × F', 'τ = Iα'] },
                { label: 'Angular Momentum', subs: ['L = Iω', 'Conservation'] },
                { label: 'Rolling', subs: ['v = Rω', 'KE = ½mv² + ½Iω²'] }
            ]
        },
        // CHEMISTRY
        'Some Basic Concepts': {
            branches: [
                { label: 'Matter', subs: ['Solid/Liquid/Gas', 'Element/Compound'] },
                { label: 'Mole Concept', subs: ['n = m/M', 'Nₐ = 6.022×10²³'] },
                { label: 'Stoichiometry', subs: ['Balancing Equations', 'Limiting Reagent'] },
                { label: 'Atomic Mass', subs: ['AMU', 'Molecular Mass'] },
                { label: 'Percentage Yield', subs: ['Actual/Theoretical', '% Composition'] }
            ]
        },
        'Atomic Structure': {
            branches: [
                { label: 'Subatomic Particles', subs: ['e⁻, p⁺, n⁰', 'Discovery'] },
                { label: "Bohr's Model", subs: ['E = -13.6/n² eV', 'Orbits'] },
                { label: 'Quantum Numbers', subs: ['n, l, mₗ, mₛ', 'Orbitals'] },
                { label: 'Electronic Config', subs: ['Aufbau', 'Hund\'s Rule'] },
                { label: 'Atomic Models', subs: ['Thomson', 'Rutherford', 'Bohr'] }
            ]
        },
        'Chemical Bonding': {
            branches: [
                { label: 'Ionic Bonds', subs: ['Electron Transfer', 'NaCl Example'] },
                { label: 'Covalent Bonds', subs: ['Electron Sharing', 'σ and π bonds'] },
                { label: 'VSEPR Theory', subs: ['Molecular Shapes', 'Lone Pairs'] },
                { label: 'Hybridization', subs: ['sp³ Tetrahedral', 'sp² Trigonal'] },
                { label: 'Metallic Bonds', subs: ['Electron Sea', 'Conductivity'] }
            ]
        },
        'Thermodynamics': {
            branches: [
                { label: 'First Law', subs: ['ΔU = q + w', 'Energy Conservation'] },
                { label: 'Enthalpy', subs: ['ΔH = ΔU + PΔV', 'Exo/Endothermic'] },
                { label: 'Entropy', subs: ['Disorder', 'ΔS'] },
                { label: 'Gibbs Energy', subs: ['ΔG = ΔH - TΔS', 'Spontaneity'] },
                { label: 'Heat Capacity', subs: ['Cp - Cv = R', 'Specific Heat'] }
            ]
        },
        'Equilibrium': {
            branches: [
                { label: 'Dynamic Equilibrium', subs: ['Forward = Backward', 'Constant conc.'] },
                { label: 'Le Chatelier', subs: ['Stress Response', 'Shifts'] },
                { label: 'Equilibrium Constant', subs: ['Kc, Kp', 'Relationship'] },
                { label: 'Ionic Equilibrium', subs: ['pH, pOH', 'Buffer Solutions'] },
                { label: 'Solubility', subs: ['Ksp', 'Common Ion Effect'] }
            ]
        },
        // MATHEMATICS
        'Sets and Functions': {
            branches: [
                { label: 'Set Operations', subs: ['Union ∪', 'Intersection ∩', 'Complement'] },
                { label: 'Types of Sets', subs: ['Empty ∅', 'Finite', 'Infinite'] },
                { label: 'Functions', subs: ['Domain', 'Range', 'Codomain'] },
                { label: 'Types of Functions', subs: ['One-One', 'Onto', 'Bijective'] },
                { label: 'Inverse Functions', subs: ['f⁻¹(x)', 'Composition'] }
            ]
        },
        'Trigonometry': {
            branches: [
                { label: 'Ratios', subs: ['sin, cos, tan', 'cosec, sec, cot'] },
                { label: 'Identities', subs: ['sin²θ + cos²θ = 1', 'Compound Angles'] },
                { label: 'Standard Angles', subs: ['0°, 30°, 45°, 60°, 90°'] },
                { label: 'General Solutions', subs: ['sin θ = sin α', 'Periodicity'] },
                { label: 'Double Angles', subs: ['sin 2θ', 'cos 2θ'] }
            ]
        },
        'Algebra': {
            branches: [
                { label: 'Complex Numbers', subs: ['a + bi', 'Argand Plane'] },
                { label: 'Quadratic Equations', subs: ['ax² + bx + c = 0', 'Discriminant'] },
                { label: 'Sequences', subs: ['AP: a, a+d, a+2d', 'GP: a, ar, ar²'] },
                { label: 'Binomial Theorem', subs: ['(a+b)ⁿ', 'General Term'] },
                { label: 'Permutations', subs: ['nPr = n!/(n-r)!', 'Combinations'] }
            ]
        },
        'Calculus Introduction': {
            branches: [
                { label: 'Limits', subs: ['lim x→a f(x)', 'L\'Hôpital\'s Rule'] },
                { label: 'Derivatives', subs: ['dy/dx', 'Chain Rule'] },
                { label: 'Continuity', subs: ['Left = Right limit', 'Removable'] },
                { label: 'Applications', subs: ['Maxima/Minima', 'Rate of Change'] },
                { label: 'Integration', subs: ['∫f(x)dx', 'Fundamental Theorem'] }
            ]
        },
        'Coordinate Geometry': {
            branches: [
                { label: 'Straight Lines', subs: ['y = mx + c', 'Distance Formula'] },
                { label: 'Circles', subs: ['(x-h)² + (y-k)² = r²', 'General Form'] },
                { label: 'Parabola', subs: ['y² = 4ax', 'Focus, Directrix'] },
                { label: 'Ellipse', subs: ['x²/a² + y²/b² = 1', 'Eccentricity'] },
                { label: 'Hyperbola', subs: ['x²/a² - y²/b² = 1', 'Asymptotes'] }
            ]
        },
        // BIOLOGY
        'Cell Biology': {
            branches: [
                { label: 'Cell Theory', subs: ['Basic unit', 'Pre-existing cells'] },
                { label: 'Cell Types', subs: ['Prokaryotic', 'Eukaryotic'] },
                { label: 'Organelles', subs: ['Nucleus', 'Mitochondria', 'Chloroplast'] },
                { label: 'Cell Division', subs: ['Mitosis', 'Meiosis'] },
                { label: 'Cell Cycle', subs: ['G1, S, G2', 'M Phase'] }
            ]
        },
        'Plant Physiology': {
            branches: [
                { label: 'Photosynthesis', subs: ['Light Reactions', 'Calvin Cycle'] },
                { label: 'Transport', subs: ['Xylem (water)', 'Phloem (sugar)'] },
                { label: 'Transpiration', subs: ['Stomata', 'Cohesion-Tension'] },
                { label: 'Plant Hormones', subs: ['Auxin', 'Gibberellin', 'Ethylene'] },
                { label: 'Respiration', subs: ['Glycolysis', 'Krebs Cycle'] }
            ]
        },
        'Genetics': {
            branches: [
                { label: "Mendel's Laws", subs: ['Dominance', 'Segregation', 'Ind. Assortment'] },
                { label: 'DNA Structure', subs: ['Double Helix', 'A-T, G-C'] },
                { label: 'Central Dogma', subs: ['DNA→RNA→Protein', 'Transcription'] },
                { label: 'Genetic Code', subs: ['Codons', 'Universal'] },
                { label: 'Mutations', subs: ['Point', 'Frameshift', 'Chromosomal'] }
            ]
        },
        'Human Physiology': {
            branches: [
                { label: 'Digestion', subs: ['Enzymes', 'Absorption'] },
                { label: 'Circulation', subs: ['Heart', 'Blood Types'] },
                { label: 'Respiration', subs: ['Lungs', 'Gas Exchange'] },
                { label: 'Excretion', subs: ['Nephron', 'Urea Formation'] },
                { label: 'Nervous System', subs: ['Neurons', 'Reflex Arc'] }
            ]
        },
        'Ecology': {
            branches: [
                { label: 'Ecosystem', subs: ['Biotic', 'Abiotic'] },
                { label: 'Food Chain', subs: ['Producers', 'Consumers'] },
                { label: 'Energy Flow', subs: ['10% Rule', 'Pyramids'] },
                { label: 'Biodiversity', subs: ['Species', 'Genetic', 'Ecosystem'] },
                { label: 'Conservation', subs: ['In-situ', 'Ex-situ'] }
            ]
        }
    }

    const defaultBranches = [
        { label: 'Key Concepts', subs: ['Definition', 'Principles', 'Laws'] },
        { label: 'Formulas', subs: ['Main Formula', 'Derivations'] },
        { label: 'Applications', subs: ['Real World', 'JEE Problems'] },
        { label: 'Common Mistakes', subs: ['Sign Errors', 'Unit Confusion'] },
        { label: 'Practice', subs: ['Easy', 'Medium', 'Hard'] }
    ]

    // Use predefined content, or dynamically create branches from subtopics if provided
    let branches = topicContent[topic]?.branches
    if (!branches && subtopics && subtopics.length > 0) {
        // Create branches from provided subtopics
        branches = subtopics.slice(0, 6).map(sub => ({
            label: sub,
            subs: ['Key Points', 'Examples', 'Practice']
        }))
    }
    if (!branches) {
        branches = defaultBranches
    }

    const nodes = [
        {
            id: '1',
            type: 'default',
            data: { label: topic },
            position: { x: centerX, y: centerY },
            style: {
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                color: 'white',
                border: '2px solid #a78bfa',
                borderRadius: '12px',
                padding: '16px 24px',
                fontSize: '16px',
                fontWeight: 'bold'
            }
        }
    ]

    const edges = []

    branches.forEach((branch, branchIndex) => {
        const angle = (branchIndex / branches.length) * 2 * Math.PI - Math.PI / 2
        const branchId = `${branchIndex + 2}`

        // Primary node
        nodes.push({
            id: branchId,
            type: 'default',
            data: { label: branch.label },
            position: {
                x: centerX + Math.cos(angle) * primaryRadius,
                y: centerY + Math.sin(angle) * primaryRadius
            },
            style: {
                background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                color: 'white',
                border: '2px solid #38bdf8',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '13px',
                fontWeight: '500'
            }
        })

        edges.push({
            id: `e1-${branchId}`,
            source: '1',
            target: branchId,
            style: { stroke: 'rgba(139, 92, 246, 0.6)', strokeWidth: 2 },
            animated: true
        })

        // Secondary nodes
        branch.subs.forEach((sub, subIndex) => {
            const subId = `${branchId}${String.fromCharCode(97 + subIndex)}`
            const offsetAngle = (subIndex - branch.subs.length / 2 + 0.5) * 0.4

            nodes.push({
                id: subId,
                type: 'default',
                data: { label: sub },
                position: {
                    x: centerX + Math.cos(angle) * primaryRadius + Math.cos(angle + offsetAngle) * secondaryRadius,
                    y: centerY + Math.sin(angle) * primaryRadius + Math.sin(angle + offsetAngle) * secondaryRadius
                },
                style: {
                    background: '#1e293b',
                    color: '#e2e8f0',
                    border: '1px solid #475569',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '11px'
                }
            })

            edges.push({
                id: `e${branchId}-${subId}`,
                source: branchId,
                target: subId,
                style: { stroke: 'rgba(14, 165, 233, 0.4)', strokeWidth: 1 }
            })
        })
    })

    return { nodes, edges }
}

// Generate short notes as fallback when mind map isn't detailed enough
export async function generateShortNotes(topic, subtopics = []) {
    if (!hasApiKey) {
        return generateFallbackShortNotes(topic, subtopics)
    }

    const prompt = `Generate comprehensive short notes for "${topic}" suitable for JEE/NEET students.
  ${subtopics.length > 0 ? `Include these subtopics: ${subtopics.join(', ')}` : ''}
  
  Format as JSON:
  {
    "title": "${topic}",
    "sections": [
      {
        "heading": "Key Concept Name",
        "points": ["Point 1", "Point 2"],
        "formulas": ["formula1", "formula2"],
        "tips": "Exam tip"
      }
    ]
  }`

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.3, maxOutputTokens: 1500 }
            })
        })

        const data = await response.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0])
        }
    } catch (error) {
        console.error('Short notes generation error:', error)
    }

    return generateFallbackShortNotes(topic, subtopics)
}

function generateFallbackShortNotes(topic, subtopics) {
    const notes = {
        'Kinematics': {
            title: 'Kinematics - Study of Motion',
            sections: [
                {
                    heading: 'Basic Concepts',
                    points: ['Distance is scalar, Displacement is vector', 'Speed is rate of distance, Velocity is rate of displacement', 'Acceleration is rate of change of velocity'],
                    formulas: ['v = dx/dt', 'a = dv/dt'],
                    tips: 'Always identify the reference frame first!'
                },
                {
                    heading: 'Equations of Motion',
                    points: ['Use when acceleration is constant', 'Each equation omits one variable', 'Choose equation based on given data'],
                    formulas: ['v = u + at', 's = ut + ½at²', 'v² = u² + 2as'],
                    tips: 'List knowns and unknowns before choosing equation'
                },
                {
                    heading: 'Projectile Motion',
                    points: ['Horizontal and vertical motions are independent', 'Horizontal velocity remains constant', 'Maximum range at 45°'],
                    formulas: ['R = u²sin2θ/g', 'H = u²sin²θ/2g', 'T = 2usinθ/g'],
                    tips: 'Decompose initial velocity into components first'
                }
            ]
        },
        'Laws of Motion': {
            title: "Newton's Laws of Motion",
            sections: [
                {
                    heading: "Newton's First Law",
                    points: ['Law of Inertia', 'Objects resist change in motion', 'Mass measures inertia'],
                    formulas: ['If F_net = 0, then a = 0'],
                    tips: 'An object at rest OR in uniform motion stays that way'
                },
                {
                    heading: "Newton's Second Law",
                    points: ['Force causes acceleration', 'Acceleration is proportional to net force', 'Acceleration is inversely proportional to mass'],
                    formulas: ['F = ma', 'F = dp/dt'],
                    tips: 'Always draw a Free Body Diagram first!'
                },
                {
                    heading: 'Friction',
                    points: ['Static friction prevents sliding (variable)', 'Kinetic friction opposes sliding (constant)', 'μ_s > μ_k always'],
                    formulas: ['f_s ≤ μ_s N', 'f_k = μ_k N'],
                    tips: 'Friction is parallel to surface, opposes relative motion'
                }
            ]
        }
    }

    return notes[topic] || {
        title: topic,
        sections: subtopics.map(sub => ({
            heading: sub,
            points: ['Key concept 1', 'Key concept 2', 'Key concept 3'],
            formulas: ['Formula 1', 'Formula 2'],
            tips: 'Focus on understanding, not just memorizing'
        }))
    }
}

// Evaluate user's mastery explanation
export async function evaluateMastery(userExplanation, topic, tutor) {
    if (!hasApiKey) {
        return {
            score: 75,
            feedback: "Good effort! Your explanation shows understanding. Keep practicing to strengthen your grasp of the concepts."
        }
    }

    const prompt = `As ${tutor.name}, evaluate this student's explanation of "${topic}":

"${userExplanation}"

Provide:
1. A score from 0-100
2. Specific feedback on what they got right
3. Areas for improvement
4. An encouraging closing

Return as JSON: {"score": number, "feedback": "string"}`

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.5, maxOutputTokens: 512 }
            })
        })

        const data = await response.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0])
        }
    } catch (error) {
        console.error('Mastery evaluation error:', error)
    }

    return {
        score: 70,
        feedback: "Your explanation shows good understanding! Continue building on these concepts."
    }
}

// Check if API key is configured
export function isApiKeyConfigured() {
    return hasApiKey
}
