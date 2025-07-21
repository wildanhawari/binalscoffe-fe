import { useState } from "react";
import { toast } from "react-toastify";
import { axiosInstance } from "../../../auth/AxiosConfig.jsx";
import NavbarComponent from "../../NavbarComponent.jsx";
import { Breadcrumb, Button, Col, Container, Form, Row } from "react-bootstrap";
import ReactDatePicker from "react-datepicker";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import PDFViewer from "../PDFViewer.jsx";

const SalesReport = () => {
  // Gunakan objek Date, bukan timestamp
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [url, setUrl] = useState("");

  const downloadPDF = async () => {
    setUrl("");
    const id = toast.loading("Please wait...", {
      position: "top-center",
    });
    // Kirim tanggal dalam format ISO string
    let bodyContent = JSON.stringify({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
    let reqOptions = {
      url: "/api/orders-pdf",
      method: "POST",
      data: bodyContent,
    };
    try {
      const out = await axiosInstance.request(reqOptions);
      toast.update(id, {
        render: "Successfully Downloaded",
        type: "success",
        position: "top-center",
        isLoading: false,
        autoClose: 4000,
      });
      setUrl(import.meta.env.VITE_API_URL + out.data.result);
    } catch (error) {
      const errMessage = JSON.parse(error.request.response);
      toast.error(errMessage.message, {
        position: "top-center",
      });
    }
  };

  const downloadExcel = async () => {
    const id = toast.loading("Please wait...", {
      position: "top-center",
    });
    // Kirim tanggal dalam format ISO string
    let bodyContent = JSON.stringify({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
    let reqOptions = {
      url: "/api/orders-excel",
      method: "POST",
      data: bodyContent,
    };
    try {
      const out = await axiosInstance.request(reqOptions);
      toast.update(id, {
        render: "Successfully Downloaded",
        type: "success",
        position: "top-center",
        isLoading: false,
        autoClose: 4000,
      });
      window.open(import.meta.env.VITE_API_URL + out.data.result, "_blank");
    } catch (error) {
      const errMessage = JSON.parse(error.request.response);
      toast.error(errMessage.message, {
        position: "top-center",
      });
    }
  };

  return (
    <>
      <NavbarComponent />
      <Container>
        <Row className="mt-3 bg-body-tertiary rounded p-3 pb-0">
          <Col>
            <Breadcrumb>
              <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
              <Breadcrumb.Item href="#">Report</Breadcrumb.Item>
              <Breadcrumb.Item active>Sales</Breadcrumb.Item>
            </Breadcrumb>
          </Col>
        </Row>
        <Row className="mt-3 bg-body-tertiary rounded p-3">
          <Col>
            <form>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm="2">
                  Start Date
                </Form.Label>
                <Col sm="10">
                  <ReactDatePicker
                    className="form-control"
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    dateFormat="yyyy-MM-dd"
                  />
                </Col>
              </Form.Group>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm="2">
                  End Date
                </Form.Label>
                <Col sm="10">
                  <ReactDatePicker
                    className="form-control"
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    dateFormat="yyyy-MM-dd"
                  />
                </Col>
              </Form.Group>
              <Form.Group as={Row} className="mb-3">
                <Col sm="12">
                  <Button
                    type="button"
                    onClick={downloadPDF}
                    variant="dark"
                  >
                    <FaFilePdf /> Download PDF
                  </Button>
                  <Button
                    type="button"
                    onClick={downloadExcel}
                    variant="dark"
                  >
                    <FaFileExcel /> Download Excel
                  </Button>
                </Col>
              </Form.Group>
            </form>
            <PDFViewer url={url} />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default SalesReport;