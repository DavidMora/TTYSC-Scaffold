import { Button, FlexBox, Text, Title } from "@ui5/webcomponents-react";
import BaseDataTable from "@/components/Tables/BaseDataTable";
import { TableData } from "@/lib/types/datatable";
import { tableData } from "@/lib/constants/mocks/dataTable";

interface TablePageProps {
  params: Promise<{
    id: string;
  }>;
}

const getTableData = (
  id: string
): { tableId: string; tableName: string; tableData: TableData } => {
  let tableName = `Table ${id}`;

  if (id == "table-1") {
    tableName = "Demand During Lead Time";
  }

  return {
    tableId: id,
    tableName,
    tableData,
  };
};

export default async function TablePage({ params }: TablePageProps) {
  const { id } = await params;
  const { tableId, tableName, tableData } = getTableData(id);
  return (
    <>
      <FlexBox
        direction="Column"
        className="pb-4 border-b-2 border-gray-300 mb-6 sticky top-0 z-10"
      >
        <Title level="H2">{tableName}</Title>
        <Text>Here is the full table</Text>
      </FlexBox>
      <BaseDataTable
        data={tableData}
        mainClassName="w-full h-[calc(100vh-15rem)]"
        disableFullScreen={true}
        tableId={tableId}
      />
      <FlexBox>
        <Button design="Emphasized" className="mt-4">
          Download full data
        </Button>
      </FlexBox>
    </>
  );
}
