import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminDashboardStats } from "../types";

interface OrganizationStatsTableProps {
  stats: AdminDashboardStats[];
}

export const OrganizationStatsTable = ({ stats }: OrganizationStatsTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Organization</TableHead>
          <TableHead>Total Posts</TableHead>
          <TableHead>Total Views</TableHead>
          <TableHead>Scheduled</TableHead>
          <TableHead>Published</TableHead>
          <TableHead>Failed</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {stats.map((org) => (
          <TableRow key={org.organization_id}>
            <TableCell>{org.organization_name}</TableCell>
            <TableCell>{org.total_posts}</TableCell>
            <TableCell>{org.total_views}</TableCell>
            <TableCell>{org.scheduled_posts}</TableCell>
            <TableCell>{org.published_posts}</TableCell>
            <TableCell>{org.failed_posts}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
