import React, { useState } from "react";
import {
  Table,
  Button,
  Tooltip,
  Tag,
  Input,
  Space,
  Popconfirm,
  Typography,
  Modal,
  Descriptions,
  Divider,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PrinterOutlined,
  SearchOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import toast from "react-hot-toast";

const { Text } = Typography;

const QuotationList = ({
  quotations,
  onAddNew,
  onEdit,
  onDelete,
  onSearch,
  onViewNotes,
}) => {
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);

  const openViewModal = (record) => {
    setSelectedQuotation(record);
    setViewModalVisible(true);
    toast("Viewing quotation details");
  };

  const generateAndDownloadPDF = async (record) => {
    try {
      const toastId = toast.loading("Generating PDF...");
      const source = document.getElementById(`quotation-${record._id}`);
      if (!source) {
        toast.error("Quotation content not found", { id: toastId });
        return;
      }

      const clone = source.cloneNode(true);
      clone.style.position = "fixed";
      clone.style.top = "0";
      clone.style.left = "0";
      clone.style.width = "210mm";
      clone.style.background = "white";
      clone.style.zIndex = "-1";
      clone.style.display = "block";
      document.body.appendChild(clone);

      await new Promise((resolve) => setTimeout(resolve, 200));

      const canvas = await html2canvas(clone, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, width, height);

      pdf.save(`${record.quotationNumber || "quotation"}.pdf`);
      toast.success("PDF downloaded", { id: toastId });

      document.body.removeChild(clone);
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF");
    }
  };

  const handleDelete = (id) => {
    onDelete(id);
  };

  const columns = [
    {
      title: "Quotation #",
      dataIndex: "quotationNumber",
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Business",
      dataIndex: "businessName",
    },
    {
      title: "Customer",
      dataIndex: "customerName",
    },
    {
      title: "Latest Note",
      dataIndex: "notes",
      render: (notes) => {
        if (notes && notes.length > 0) {
          const latestNote = notes[notes.length - 1];
          const snippet =
            latestNote.text.length > 30
              ? `${latestNote.text.substring(0, 30)}...`
              : latestNote.text;
          return (
            <Tooltip title={latestNote.text}>
              <Text type="secondary">{snippet}</Text>
            </Tooltip>
          );
        }
        return (
          <Text type="secondary" italic>
            No notes
          </Text>
        );
      },
    },
    {
      title: "Total (₹)",
      dataIndex: "total",
      render: (amt) => (
        <Text strong style={{ color: "#52c41a" }}>
          ₹{amt.toFixed(2)}
        </Text>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
    },
    {
      title: "Actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="View">
            <Button
              icon={<EyeOutlined />}
              onClick={() => openViewModal(record)}
            />
          </Tooltip>
          <Tooltip title="Download PDF">
            <Button
              icon={<PrinterOutlined />}
              onClick={() => generateAndDownloadPDF(record)}
            />
          </Tooltip>
          <Tooltip title="Notes">
            <Button
              icon={<MessageOutlined />}
              onClick={() => {
                onViewNotes(record);
                toast("Viewing notes");
              }}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                onEdit(record);
                toast("Editing quotation");
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this quotation?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button icon={<DeleteOutlined />} danger />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Space
        style={{
          marginBottom: 16,
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Input.Search
          placeholder="Search..."
          onChange={(e) => {
            onSearch(e.target.value);
            toast("Searching...");
          }}
          style={{ width: 300 }}
          prefix={<SearchOutlined />}
        />
        <Button
          type="primary"
          onClick={() => {
            onAddNew();
            toast("Creating new quotation");
          }}
        >
          + New Quotation
        </Button>
      </Space>

      <Table columns={columns} dataSource={quotations} rowKey="_id" />

      <Modal
        title="Quotation Details"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button
            key="download"
            icon={<PrinterOutlined />}
            onClick={() => generateAndDownloadPDF(selectedQuotation)}
          >
            Download PDF
          </Button>,
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={900}
      >
        {selectedQuotation && (
          <div id={`quotation-${selectedQuotation._id}`}>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Quotation Number">
                <Tag color="blue">{selectedQuotation.quotationNumber}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Date">
                {selectedQuotation.date}
              </Descriptions.Item>
              <Descriptions.Item label="Business Name">
                {selectedQuotation.businessName}
              </Descriptions.Item>
              <Descriptions.Item label="Customer Name">
                {selectedQuotation.customerName}
              </Descriptions.Item>
              <Descriptions.Item label="GSTIN" span={2}>
                <Text code>{selectedQuotation.gstin || "N/A"}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Business Info" span={2}>
                <Text style={{ whiteSpace: "pre-wrap" }}>
                  {selectedQuotation.businessInfo || "N/A"}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Customer Address" span={2}>
                <Text style={{ whiteSpace: "pre-wrap" }}>
                  {selectedQuotation.customerAddress || "N/A"}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Total Amount" span={2}>
                <Text
                  style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: "#52c41a",
                  }}
                >
                  ₹{(selectedQuotation.total || 0).toFixed(2)}
                </Text>
              </Descriptions.Item>
            </Descriptions>

            {selectedQuotation.items?.length > 0 && (
              <>
                <Divider orientation="left">Items</Divider>
                <Table
                  dataSource={selectedQuotation.items}
                  columns={[
                    {
                      title: "Description",
                      dataIndex: "description",
                      ellipsis: true,
                    },
                    {
                      title: "HSN/SAC",
                      dataIndex: "hsnSac",
                      width: 100,
                      align: "center",
                    },
                    {
                      title: "Qty",
                      dataIndex: "quantity",
                      width: 80,
                      align: "center",
                    },
                    {
                      title: "Rate (₹)",
                      dataIndex: "rate",
                      width: 120,
                      align: "right",
                      render: (rate) => `₹${(rate || 0).toFixed(2)}`,
                    },
                    {
                      title: "Amount (₹)",
                      width: 120,
                      align: "right",
                      render: (_, item) => (
                        <Text strong>
                          ₹{(item.quantity * item.rate).toFixed(2)}
                        </Text>
                      ),
                    },
                  ]}
                  pagination={false}
                  size="small"
                  rowKey={(item, idx) => idx}
                  bordered
                />
              </>
            )}
          </div>
        )}
      </Modal>

      {/* HIDDEN DOM FOR PDF DOWNLOAD */}
      {quotations.map((quotation) => (
        <div
          key={quotation._id}
          id={`quotation-${quotation._id}`}
          style={{ display: "none" }}
        >
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="Quotation Number">
              <Tag color="blue">{quotation.quotationNumber}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Date">{quotation.date}</Descriptions.Item>
            <Descriptions.Item label="Business Name">
              {quotation.businessName}
            </Descriptions.Item>
            <Descriptions.Item label="Customer Name">
              {quotation.customerName}
            </Descriptions.Item>
            <Descriptions.Item label="GSTIN" span={2}>
              <Text code>{quotation.gstin || "N/A"}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Business Info" span={2}>
              <Text style={{ whiteSpace: "pre-wrap" }}>
                {quotation.businessInfo || "N/A"}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Customer Address" span={2}>
              <Text style={{ whiteSpace: "pre-wrap" }}>
                {quotation.customerAddress || "N/A"}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Total Amount" span={2}>
              <Text
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#52c41a",
                }}
              >
                ₹{(quotation.total || 0).toFixed(2)}
              </Text>
            </Descriptions.Item>
          </Descriptions>

          {quotation.items?.length > 0 && (
            <>
              <Divider orientation="left">Items</Divider>
              <Table
                dataSource={quotation.items}
                columns={[
                  {
                    title: "Description",
                    dataIndex: "description",
                    ellipsis: true,
                  },
                  {
                    title: "HSN/SAC",
                    dataIndex: "hsnSac",
                    width: 100,
                    align: "center",
                  },
                  {
                    title: "Qty",
                    dataIndex: "quantity",
                    width: 80,
                    align: "center",
                  },
                  {
                    title: "Rate (₹)",
                    dataIndex: "rate",
                    width: 120,
                    align: "right",
                    render: (rate) => `₹${(rate || 0).toFixed(2)}`,
                  },
                  {
                    title: "Amount (₹)",
                    width: 120,
                    align: "right",
                    render: (_, item) => (
                      <Text strong>
                        ₹{(item.quantity * item.rate).toFixed(2)}
                      </Text>
                    ),
                  },
                ]}
                pagination={false}
                size="small"
                rowKey={(item, idx) => idx}
                bordered
              />
            </>
          )}
        </div>
      ))}
    </>
  );
};

export default QuotationList;
