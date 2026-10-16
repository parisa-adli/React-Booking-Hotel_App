import { useCities } from "../context/CitiesProvider";

function Footer() {
  const { cities } = useCities();
  const dates = [...new Set(cities.map((city) => city.snapshotDate))].sort();
  const snapshot = dates.length ? dates[dates.length - 1] : null;

  return (
    <footer className="footer">
      <p>
        Listing data ©{" "}
        <a href="https://insideairbnb.com/get-the-data/" target="_blank" rel="noopener noreferrer">
          Inside Airbnb
        </a>
        , licensed{" "}
        <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">
          CC BY 4.0
        </a>
        {snapshot && <>, snapshot {snapshot}</>}. Prices are snapshot prices; this demo
        doesn&apos;t take bookings.
      </p>
      <p>Not affiliated with Airbnb.</p>
    </footer>
  );
}

export default Footer;
