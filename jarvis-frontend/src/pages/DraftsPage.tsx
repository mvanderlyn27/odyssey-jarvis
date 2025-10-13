import { Outlet, useParams } from "react-router-dom";
import DraftCreator from "@/features/drafts/components/DraftCreator";
import DraftsList from "@/features/drafts/components/DraftsList";

const DraftsPage = () => {
  const { id } = useParams();

  return (
    <div className="container mx-auto p-4">
      {!id && (
        <>
          <h1 className="text-2xl font-bold mb-4">Drafts</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <DraftCreator />
            </div>
            <div className="md:col-span-2">
              <DraftsList />
            </div>
          </div>
        </>
      )}
      <Outlet />
    </div>
  );
};

export default DraftsPage;
