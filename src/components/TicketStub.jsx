function TicketStub({ ticketNumber, doctorName, date, label = 'Your ticket', children }) {
  return (
    <section className="ticket-stub text-center">
      <div className="px-6 pt-7 pb-6 sm:px-10 sm:pt-9">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/60">{label}</p>
        <p className="ticket-number mt-4 text-7xl sm:text-8xl">#{ticketNumber}</p>
        {(doctorName || date) && (
          <div className="mt-7 border-t border-dashed border-ink/25 pt-5 text-sm text-ink/70">
            {doctorName && <p className="font-semibold text-ink">{doctorName}</p>}
            {date && <p className="mt-1">{date}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  )
}

export default TicketStub
