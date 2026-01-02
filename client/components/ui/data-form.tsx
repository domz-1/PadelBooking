"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, UseFormReturn, FieldValues, DefaultValues } from "react-hook-form"
import { z } from "zod"
import { Form } from "@/components/ui/form"

interface DataFormProps<T extends FieldValues> {
    schema: z.ZodSchema<T>
    defaultValues?: DefaultValues<T>
    onSubmit: (data: T) => void
    children: (form: UseFormReturn<T>) => React.ReactNode
    className?: string
}

export function DataForm<T extends FieldValues>({
    schema,
    defaultValues,
    onSubmit,
    children,
    className,
}: DataFormProps<T>) {
    const form = useForm<T>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(schema as any) as any,
        defaultValues,
    })

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className={className}>
                {children(form)}
            </form>
        </Form>
    )
}
