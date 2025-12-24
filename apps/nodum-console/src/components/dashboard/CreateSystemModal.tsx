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
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useSystems } from "@/hooks/use-systems"
import { Loader2 } from "lucide-react"

const systemSchema = z.object({
    name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    slug: z.string().min(3, "Slug deve ter pelo menos 3 caracteres").regex(/^[a-z0-9-]+$/, "Apenas letras minúsculas, números e hifens"),
    description: z.string().optional(),
})

type SystemFormValues = z.infer<typeof systemSchema>

interface CreateSystemModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export function CreateSystemModal({ isOpen, onClose, onSuccess }: CreateSystemModalProps) {
    const { createSystem, isSubmitting } = useSystems()

    const form = useForm<SystemFormValues>({
        resolver: zodResolver(systemSchema),
        defaultValues: {
            name: "",
            slug: "",
            description: "",
        },
    })

    const onSubmit = async (values: SystemFormValues) => {
        try {
            await createSystem(values)
            form.reset()
            onSuccess()
            onClose()
        } catch (error) {
            // Error handled in hook toast
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Nexus System Vertical</DialogTitle>
                    <DialogDescription>
                        Provisione uma nova infraestrutura de negócio no Kernel Nodum.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome da Vertical</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: AMBRA (Food & Experience)" {...field} />
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
                                    <FormLabel>System ID (Slug)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="ex: ambra-food" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descrição Técnica</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Finalidade deste sistema no ecossistema..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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
                                Launch Vertical
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
