'use client';

import { useState } from 'react';
import { createClient } from '../../../lib/figma-make-helpers';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Card } from '../../../components/ui/card';
import { Building2, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const supabase = createClient();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/definir-nova-senha`,
      });

      if (error) throw error;

      setEmailSent(true);
      toast.success('Email enviado com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-[#1F4788] p-4 rounded-full mb-4">
            <Building2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-gray-900 text-center">Recuperar Senha</h1>
          <p className="text-gray-600 text-center">
            Digite seu email para receber instruções
          </p>
        </div>

        {emailSent ? (
          <div className="text-center">
            <div className="bg-green-50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-gray-900 mb-2">Email enviado!</h3>
            <p className="text-gray-600 mb-6">
              Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
            </p>
            <Link href="/login">
              <Button className="w-full bg-[#1F4788] hover:bg-blue-800">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Login
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#1F4788] hover:bg-blue-800"
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar Email de Recuperação'}
            </Button>

            <Link href="/login">
              <Button variant="ghost" className="w-full" type="button">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Login
              </Button>
            </Link>
          </form>
        )}
      </Card>
    </div>
  );
}