import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { UserPlus, Send, ArrowLeft, ArrowRight, X, Gift } from 'lucide-react';

const AmigoInvisible = () => {
  const [step, setStep] = useState(1);
  const [participants, setParticipants] = useState([
    { id: 1, name: '', email: '' }
  ]);
  const [message, setMessage] = useState({
    subject: '$NOMBRE, Sorteo del Amigo Invisible',
    body: '$NOMBRE, te ha tocado regalar a $AMIGO_INVISIBLE\nPrecio aprox: 20€\nFecha límite: 24 Diciembre\nLugar: Oficina'
  });
  const [organizer, setOrganizer] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const addParticipant = () => {
    setParticipants([
      ...participants,
      { id: Date.now(), name: '', email: '' }
    ]);
  };

  const updateParticipant = (id, field, value) => {
    setParticipants(participants.map(p => 
      p.id === id ? {...p, [field]: value} : p
    ));
  };

  const removeParticipant = (id) => {
    if (participants.length > 1) {
      setParticipants(participants.filter(p => p.id !== id));
    }
  };

  const sendEmails = async () => {
    if (!participants.every(p => p.name && p.email)) {
      setStatus('error');
      return;
    }

    try {
      setLoading(true);
      setStatus('loading');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/sorteo`, {

        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participants, message, organizer })
      });

      const data = await response.json();
      setStatus(data.success ? 'success' : 'error');
    } catch (error) {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const getStepProgress = () => ((step / 3) * 100);

  return (
    <div className="container max-w-2xl mx-auto p-4">
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Gift className="h-6 w-6" />
            Sorteo Amigo Invisible
          </CardTitle>
          <CardDescription className="text-center">
            Organiza tu sorteo de Amigo Invisible de forma fácil y rápida
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Progress value={getStepProgress()} className="w-full" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Participantes</span>
              <span>Mensaje</span>
              <span>Enviar</span>
            </div>
          </div>

          <Separator />

          {step === 1 && (
            <div className="space-y-4 animate-in fade-in-50">
              <div className="space-y-4">
                {participants.map((p, index) => (
                  <div key={p.id} className="flex items-center gap-2">
                    <Input
                      placeholder="Nombre"
                      value={p.name}
                      onChange={e => updateParticipant(p.id, 'name', e.target.value)}
                    />
                    <Input
                      placeholder="Email"
                      type="email"
                      value={p.email}
                      onChange={e => updateParticipant(p.id, 'email', e.target.value)}
                    />
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => removeParticipant(p.id)}
                      disabled={participants.length === 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={addParticipant}
                  className="flex items-center gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  Añadir participante
                </Button>
                <Button onClick={() => setStep(2)}>
                  Siguiente
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in-50">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    placeholder="Asunto del email"
                    value={message.subject}
                    onChange={e => setMessage({...message, subject: e.target.value})}
                  />
                  <Textarea
                    placeholder="Mensaje para los participantes"
                    value={message.body}
                    onChange={e => setMessage({...message, body: e.target.value})}
                    rows={6}
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Atrás
                </Button>
                <Button onClick={() => setStep(3)}>
                  Siguiente
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in-50">
              <Input
                placeholder="Tu nombre (organizador)"
                value={organizer}
                onChange={e => setOrganizer(e.target.value)}
              />

              {status === 'error' && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    Hubo un problema al enviar los emails. Por favor, inténtalo de nuevo.
                  </AlertDescription>
                </Alert>
              )}

              {status === 'success' && (
                <Alert className="bg-green-50 border-green-200">
                  <AlertTitle>¡Éxito!</AlertTitle>
                  <AlertDescription>
                    Los emails han sido enviados correctamente.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Atrás
                </Button>
                <Button 
                  onClick={sendEmails}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {loading ? 'Enviando...' : 'Enviar sorteo'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AmigoInvisible;