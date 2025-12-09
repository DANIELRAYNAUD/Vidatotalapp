import { useState, useEffect, useRef } from 'react'
import { Howl } from 'howler'
import { Play, Pause, Volume2, VolumeX, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import * as Slider from '@radix-ui/react-slider'
import { cn } from '@/lib/utils'

interface FaixaAudio {
    id: string
    nome: string
    tipo: 'classica' | 'lofi' | 'ambiente' | 'binaural' | 'natureza' | 'ruido'
    frequencia?: string
    caminhoArquivo: string
    volume: number
    ativada: boolean
}

export function FocusAudioPlayer() {
    // Mock de faixas - em produção, viria do banco de dados
    const [faixas] = useState<FaixaAudio[]>([
        {
            id: '1',
            nome: 'Mozart Piano Sonata',
            tipo: 'classica',
            frequencia: '432Hz',
            caminhoArquivo: '/audio/classical-432hz/mozart-piano-sonata.mp3',
            volume: 0.7,
            ativada: true,
        },
        {
            id: '2',
            nome: 'Chuva na Floresta',
            tipo: 'natureza',
            caminhoArquivo: '/audio/nature/rain-on-leaves.mp3',
            volume: 0.3,
            ativada: false,
        },
        {
            id: '3',
            nome: 'Beta Waves (15Hz Foco)',
            tipo: 'binaural',
            frequencia: '15Hz',
            caminhoArquivo: '/audio/binaural/beta-15hz-focus.mp3',
            volume: 0.2,
            ativada: false,
        },
        {
            id: '4',
            nome: 'Ruído Rosa',
            tipo: 'ruido',
            caminhoArquivo: '/audio/noise/pink-noise.mp3',
            volume: 0.15,
            ativada: false,
        },
        {
            id: '5',
            nome: 'Lo-fi Chill Beats',
            tipo: 'lofi',
            caminhoArquivo: '/audio/lofi/chill-beats-01.mp3',
            volume: 0.5,
            ativada: false,
        },
        {
            id: '6',
            nome: 'Deep Space Ambient',
            tipo: 'ambiente',
            caminhoArquivo: '/audio/ambient/deep-space.mp3',
            volume: 0.4,
            ativada: false,
        },
    ])

    const [tocando, setTocando] = useState(false)
    const [volumes, setVolumes] = useState<Record<string, number>>({})
    const [faixasAtivadas, setFaixasAtivadas] = useState<Record<string, boolean>>({})

    const sonsRef = useRef<Record<string, Howl>>({})

    // Inicializar Howler sounds (em produção, carregar apenas quando necessário)
    useEffect(() => {
        faixas.forEach((faixa) => {
            // Mock: não carregar arquivos reais ainda
            // sonsRef.current[faixa.id] = new Howl({
            //   src: [faixa.caminhoArquivo],
            //   loop: true,
            //   volume: faixa.volume,
            //   preload: true,
            // })

            setVolumes((prev) => ({ ...prev, [faixa.id]: faixa.volume }))
            setFaixasAtivadas((prev) => ({ ...prev, [faixa.id]: faixa.ativada }))
        })

        return () => {
            Object.values(sonsRef.current).forEach((som) => som?.unload())
        }
    }, [faixas])

    const alternarPlayback = () => {
        if (tocando) {
            // Pausar todas as faixas ativadas
            Object.entries(faixasAtivadas).forEach(([id, ativada]) => {
                if (ativada) sonsRef.current[id]?.pause()
            })
        } else {
            // Tocar todas as faixas ativadas
            Object.entries(faixasAtivadas).forEach(([id, ativada]) => {
                if (ativada) sonsRef.current[id]?.play()
            })
        }
        setTocando(!tocando)
    }

    const alternarFaixa = (faixaId: string) => {
        const novaAtivacao = !faixasAtivadas[faixaId]
        setFaixasAtivadas((prev) => ({ ...prev, [faixaId]: novaAtivacao }))

        if (tocando) {
            if (novaAtivacao) {
                sonsRef.current[faixaId]?.play()
            } else {
                sonsRef.current[faixaId]?.pause()
            }
        }
    }

    const mudarVolume = (faixaId: string, valor: number[]) => {
        const vol = valor[0]
        setVolumes((prev) => ({ ...prev, [faixaId]: vol }))
        sonsRef.current[faixaId]?.volume(vol)
    }

    const getIconeTipo = (tipo: FaixaAudio['tipo']) => {
        const icones = {
            classica: '🎼',
            lofi: '🎧',
            ambiente: '🌌',
            binaural: '🧠',
            natureza: '🌿',
            ruido: '📻',
        }
        return icones[tipo]
    }

    return (
        <Card className="p-lg bg-background-card backdrop-blur-card border-0">
            <div className="flex items-center justify-between mb-lg">
                <h3 className="text-h3 text-text-primary">Mixer de Áudio Foco</h3>
                <Button onClick={alternarPlayback} size="lg" className="rounded-full w-14 h-14">
                    {tocando ? <Pause /> : <Play />}
                </Button>
            </div>

            <div className="space-y-md">
                {faixas.map((faixa) => (
                    <div
                        key={faixa.id}
                        className={cn(
                            'p-md rounded-lg bg-background/50 border-2 transition-all',
                            faixasAtivadas[faixa.id] ? 'border-accent-success' : 'border-transparent'
                        )}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => alternarFaixa(faixa.id)}
                                    className={cn(
                                        'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                                        faixasAtivadas[faixa.id]
                                            ? 'bg-accent-success text-background'
                                            : 'bg-background text-text-secondary'
                                    )}
                                >
                                    <Layers size={20} />
                                </button>
                                <div>
                                    <p className="text-body font-medium text-text-primary flex items-center gap-2">
                                        <span>{getIconeTipo(faixa.tipo)}</span>
                                        {faixa.nome}
                                    </p>
                                    {faixa.frequencia && (
                                        <p className="text-caption text-text-secondary">{faixa.frequencia}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {volumes[faixa.id] > 0 ? (
                                    <Volume2 size={18} className="text-text-secondary" />
                                ) : (
                                    <VolumeX size={18} className="text-text-secondary" />
                                )}
                                <span className="text-caption text-text-secondary w-8">
                                    {Math.round(volumes[faixa.id] * 100)}%
                                </span>
                            </div>
                        </div>

                        <Slider.Root
                            className={cn(
                                'relative flex items-center select-none touch-none w-full h-5',
                                !faixasAtivadas[faixa.id] && 'opacity-50'
                            )}
                            value={[volumes[faixa.id]]}
                            onValueChange={(value: number[]) => mudarVolume(faixa.id, value)}
                            max={1}
                            step={0.01}
                            disabled={!faixasAtivadas[faixa.id]}
                        >
                            <Slider.Track className="bg-white/10 relative grow rounded-full h-1">
                                <Slider.Range className="absolute bg-primary-green rounded-full h-full" />
                            </Slider.Track>
                            <Slider.Thumb
                                className="block w-4 h-4 bg-white rounded-full shadow-md hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-primary-green"
                                aria-label="Volume"
                            />
                        </Slider.Root>
                    </div>
                ))}
            </div>

            <div className="mt-lg p-md bg-background/30 rounded-lg">
                <p className="text-caption text-text-secondary">
                    💡 <strong>Dica:</strong> Combine múltiplas camadas para criar seu ambiente sonoro
                    ideal. Beta waves (12-20Hz) aumentam foco e alertness.
                </p>
            </div>
        </Card>
    )
}
