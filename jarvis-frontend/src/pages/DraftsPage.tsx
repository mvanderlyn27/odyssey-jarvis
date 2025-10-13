import { Outlet, useParams } from "react-router-dom";
import DraftsList from "@/features/drafts/components/DraftsList";

const DraftsPage = () => {
  const { id } = useParams();

  return (
    <div className="container mx-auto p-4">
      {!id && (
        <>
          <h1 className="text-2xl font-bold mb-4">Drafts</h1>
          <DraftsList />
        </>
      )}
      <Outlet />
    </div>
  );
};

export default DraftsPage;
