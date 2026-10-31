
import { Construction } from "lucide-react";

function PlaceholderPage({ title, description }) {
  return (
    <div className="placeholder-page">
      <div className="placeholder-icon">
        <Construction size={30} />
      </div>

      <h1>{title}</h1>
      <p>{description}</p>

      <span className="coming-soon">
        MODULE UNDER DEVELOPMENT
      </span>
    </div>
  );
}

export default PlaceholderPage;
