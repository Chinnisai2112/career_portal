export default function PageHeader({ pill, title, lead, children }) {
  return (
    <header className="relative">
      {pill && <span className="cp-pill">{pill}</span>}
      <h1 className="cp-h1 mt-3">{title}</h1>
      {lead && <p className="cp-lead">{lead}</p>}
      {children}
    </header>
  );
}
