import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { getData } from "./lib/api"
import { useMutation } from "@tanstack/react-query"
import { Result } from "@server/types/types"
import { useState } from "react"
import { DataTable } from "./components/data-table"
import { columns } from "./components/columns"
import { Spinner } from "./components/ui/spinner"

function App() {
  const [data, setData] = useState<Result[] | null>([])
  const formSchema = z.object({
    query: z.string().min(2).max(100),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: "",
    },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: async (query: string) => await getData(query),
    onSuccess: async (data) => {
      setData(data)
    }
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    mutate(values.query)
  }

  return (
    <div className='container mx-auto flex items-center justify-center flex-col'>
      <h1 className="text-5xl font-bold my-20">
        Google maps scraper
      </h1>
      <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-end gap-4">
            <FormField
              control={form.control}
              name="query"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Búsqueda
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Paisajismo Rosario"
                      className="w-96"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              disabled={isPending}
              type="submit"
            >
              {
                isPending ? "Buscando..." : "Buscar"
              }
              {
                isPending && (
                  <Spinner size="small" show={true} className="text-black" />
                )
              }
            </Button>
          </form>
        </Form>
      </div>
      <div className="w-full my-10">
        {
          data && (
            <DataTable isLoading={isPending} columns={columns} data={data} />
          )
        }
      </div>
    </div>
  )
}

export default App
