import { Link } from 'react-router-dom'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

/**
 * One column of linked record names, for the related collections that carry
 * nothing worth a second column.
 */
interface Props {
  heading: string
  records: readonly { readonly id: number; readonly name: string; readonly path: string }[]
}

export function NameTable({ heading, records }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{heading}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.map((record) => (
          <TableRow key={record.id}>
            <TableCell>
              <Link to={record.path} className="font-medium underline-offset-4 hover:underline">
                {record.name}
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
