'use client';

import { useState } from 'react';

export default function EchoPromptBuilder() {
    const [question, setQuestion] = useState('What matters most?');
    const [jsonOutput, setJsonOutput] = useState('');

    const generate = () => {
        const data = { question };
        setJsonOutput(JSON.stringify(data, null, 2));
    };

    return (
        <div>
            <h2>ECHO_PROMPT // BUILDER</h2>
            <div style={{ marginBottom: '10px' }}>
                <label>Question:</label>
                <input
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    style={{ width: '100%', background: '#111', color: '#fff' }}
                />
            </div>

            <button onClick={generate} style={{ marginBottom: '10px' }}>Generate JSON</button>
            <textarea value={jsonOutput} readOnly style={{ width: '100%', height: '200px', background: '#000', color: '#0f0' }} />
        </div>
    );
}
