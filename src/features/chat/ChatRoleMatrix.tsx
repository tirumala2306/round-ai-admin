import { CHAT_ROLE_MATRIX } from './capabilities';

export function ChatRoleMatrix() {
  return (
    <section
      className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5"
      aria-labelledby="chat-role-matrix-heading"
    >
      <h2 id="chat-role-matrix-heading" className="font-medium">
        Chat role matrix
      </h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Enforcement is on the backend (<code className="text-xs">admin</code> today). Compliance / two-person
        approval is recommended for purge and export but not wired until policy (Q1). See{' '}
        <code className="text-xs">docs/CHAT-GOVERNANCE.md</code>.
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-[var(--muted)]">
            <tr>
              <th className="py-2 pr-3" scope="col">
                Action
              </th>
              <th className="py-2 pr-3" scope="col">
                admin
              </th>
              <th className="py-2 pr-3" scope="col">
                compliance
              </th>
              <th className="py-2" scope="col">
                Notes
              </th>
            </tr>
          </thead>
          <tbody>
            {CHAT_ROLE_MATRIX.map((row) => (
              <tr key={row.action} className="border-t border-[var(--border)] align-top">
                <th scope="row" className="py-2 pr-3 font-normal">
                  {row.label}
                </th>
                <td className="py-2 pr-3">{row.admin ? 'yes' : 'no'}</td>
                <td className="py-2 pr-3">{row.compliance}</td>
                <td className="py-2 text-[var(--muted)]">{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
