import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TikTokAccount } from "@/features/tiktok/types";

interface SingleAccountSelectorProps {
  accounts: TikTokAccount[];
  onAccountChange: (accountId: string) => void;
  placeholder?: string;
}

const SingleAccountSelector: React.FC<SingleAccountSelectorProps> = ({
  accounts,
  onAccountChange,
  placeholder = "Select an account",
}) => {
  return (
    <Select onValueChange={onAccountChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {accounts.map((account) => (
          <SelectItem key={account.id} value={account.id}>
            {account.display_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SingleAccountSelector;
