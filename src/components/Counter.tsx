import { useState } from 'react'
import { Button } from './Button'

export const Counter = () => {
    const [count, setCount] = useState(0)

    return (
        <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column', alignItems: 'center' }}>
            <div data-testid="count-display" style={{ fontSize: '2em', fontWeight: 'bold' }}>
                count is {count}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
                <Button onClick={() => setCount((count) => count + 1)}>
                    Increment
                </Button>
                <Button variant="secondary" onClick={() => setCount((count) => count - 1)}>
                    Decrement
                </Button>
            </div>
        </div>
    )
}
