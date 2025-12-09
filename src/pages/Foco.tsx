import { PomodoroTimer } from '@/components/modules/PomodoroTimer'
import { FocusAudioPlayer } from '@/components/modules/FocusAudioPlayer'

export function Foco() {
    return (
        <div className="space-y-xl max-w-6xl mx-auto">
            <div>
                <h1 className="text-h1 font-bold text-text-primary mb-sm">
                    🧠 Centro de Foco & Flow State
                </h1>
                <p className="text-body-lg text-text-secondary">
                    Use o Pomodoro Timer e o mixer de áudio para entrar em estado de flow profundo
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl">
                <div>
                    <PomodoroTimer />
                </div>

                <div>
                    <FocusAudioPlayer />
                </div>
            </div>
        </div>
    )
}
