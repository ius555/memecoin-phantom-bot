import { PageHeader } from '../components/PageHeader'

/** Pagină provizorie pentru unelte încă neimplementate. */
export function ComingSoon({ title }: { title: string }) {
  return (
    <div>
      <PageHeader back={true} title={title} />
      <div className="card py-10 text-center text-muted">În curând 🛠️</div>
    </div>
  )
}
