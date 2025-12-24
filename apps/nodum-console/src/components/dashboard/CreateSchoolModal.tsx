"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useSchools } from "@/hooks/use-schools"
import { Loader2 } from "lucide-react"

const schoolSchema = z.object({
    name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    taxId: z.string().min(14, "CNPJ inválido").max(18),
    slug: z.string().min(3, "Slug deve ter pelo menos 3 caracteres"),
    systemId: z.string().uuid("Selecione uma vertical válida"),
    planId: z.string().uuid("Selecione um plano válido"),
    adminName: z.string().min(3, "Nome do gestor inválido"),
    adminEmail: z.string().email("E-mail do gestor inválido"),
    adminPassword: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
})

type SchoolFormValues = z.infer<typeof schoolSchema>

interface CreateSchoolModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    systems: any[]
    plans: any[]
}

export function CreateSchoolModal({ isOpen, onClose, onSuccess, systems, plans }: CreateSchoolModalProps) {
    const { createSchool, isSubmitting } = useSchools()

    const form = useForm<SchoolFormValues>({
        resolver: zodResolver(schoolSchema),
        defaultValues: {
            name: "",
            taxId: "",
            slug: "",
            systemId: "",
            planId: "",
            adminName: "",
            adminEmail: "",
            adminPassword: "",
        },
    })

    const onSubmit = async (values: SchoolFormValues) => {
        try {
            await createSchool(values)
            form.reset()
            onSuccess()
            onClose()
        } catch (error) {
            // Error handled in hook toast
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Nexus Tenant Provisioning</DialogTitle>
                    <DialogDescription>
                        Inaugure uma nova instância isolada e crie o usuário mestre da unidade.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-6">
                                <h3 className="text-[10px] font-black text-[#B23611] uppercase tracking-widest border-b border-[#B23611]/20 pb-2">Dados da Instituição</h3>

                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nome da Unidade</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ex: Colégio Magnum" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="taxId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>CNPJ / Tax ID</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="00.000.000/0000-00" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="slug"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tenant ID (Slug)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="magnum-bh" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="systemId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Vertical de Negócio</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione o Sistema" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {systems.map((sys) => (
                                                        <SelectItem key={sys.id} value={sys.id}>{sys.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="planId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Plano de Assinatura</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione o Plano" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {plans.map((plan) => (
                                                        <SelectItem key={plan.id} value={plan.id}>{plan.name} - R$ {Number(plan.price).toFixed(2)}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-[10px] font-black text-[#B23611] uppercase tracking-widest border-b border-[#B23611]/20 pb-2">Gestor da Unidade (Master)</h3>

                                <FormField
                                    control={form.control}
                                    name="adminName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nome Completo</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Nome do Administrador" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="adminEmail"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>E-mail de Acesso</FormLabel>
                                            <FormControl>
                                                <Input placeholder="admin@escola.com.br" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="adminPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Senha de Acesso</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="********" {...field} />
                                            </FormControl>
                                            <FormDescription>Esta senha será exigida no primeiro login da unidade.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="rounded-2xl h-12 px-8 font-bold uppercase text-[10px] tracking-widest border-white/5 bg-white/5"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                variant="nodum"
                                disabled={isSubmitting}
                                className="rounded-2xl h-12 px-8 font-black uppercase text-[10px] tracking-widest"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin mr-2" size={14} /> : null}
                                Provision School
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
