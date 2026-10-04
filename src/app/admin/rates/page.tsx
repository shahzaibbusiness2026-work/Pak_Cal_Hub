import RatesDashboard from '../../../components/admin/RatesDashboard';

export const metadata = { title: 'Market Rates | Admin' };

export default function AdminRatesPage() {
  return <RatesDashboard defaultTab="rates" />;
}
