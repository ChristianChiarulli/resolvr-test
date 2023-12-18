import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export default function BountyTags() {
  return (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select tag" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="light">bitcoin</SelectItem>
        <SelectItem value="dark">lightning</SelectItem>
        <SelectItem value="system">nostr</SelectItem>
      </SelectContent>
    </Select>
  );
}
