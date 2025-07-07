import React from 'react';
import { CSVLink } from 'react-csv';

interface Transaction {
  id: string;
  walletId: string;
  amount: number;
  balance: number;
  description: string;
  date: string;
  type: 'CREDIT' | 'DEBIT';
}

interface ExportButtonProps {
  data: Transaction[];
  filename: string;
  className?: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({ data, filename, className }) => {
  console.log("exported");
  return (
    <CSVLink
      data={data}
      filename={filename}
      className={className}
    >
      Export CSV
    </CSVLink>
  );
};

export default ExportButton;
