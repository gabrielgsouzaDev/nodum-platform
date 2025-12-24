/**
 * PlansView Component
 * 
 * Gerenciamento de planos de assinatura
 * Cards responsivos com informações detalhadas
 */

import { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockPlans } from '@/lib/mock-data';

export function PlansView() {
  const [plans] = useState(mockPlans);
  const activePlans = plans.filter(p => p.status === 'ACTIVE');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Plans</h2>
          <p className="text-muted-foreground mt-1">Manage subscription plans</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {activePlans.map((plan) => {
          const finalPrice = plan.price * (1 - plan.discountPercent / 100);
          
          return (
            <Card key={plan.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
              {plan.discountPercent > 0 && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-destructive text-white">
                    -{plan.discountPercent}%
                  </Badge>
                </div>
              )}
              
              <CardHeader className="pb-4">
                <CardTitle className="text-xl md:text-2xl">{plan.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    {plan.discountPercent > 0 && (
                      <span className="text-xl md:text-2xl text-muted-foreground line-through">
                        ${plan.price.toFixed(2)}
                      </span>
                    )}
                    <span className="text-3xl md:text-4xl font-bold">
                      ${finalPrice.toFixed(2)}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground">Max Students</span>
                    <span className="font-semibold">{plan.maxStudents}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground">Max Canteens</span>
                    <span className="font-semibold">{plan.maxCanteens}</span>
                  </div>
                </div>

                {plan.features && plan.features.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Features:</p>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button className="w-full" variant="outline">
                  Edit Plan
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {plans.filter(p => p.status === 'RETIRED').length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg md:text-xl font-semibold">Retired Plans</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {plans.filter(p => p.status === 'RETIRED').map((plan) => (
              <Card key={plan.id} className="opacity-60">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <Badge variant="secondary">Retired</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
