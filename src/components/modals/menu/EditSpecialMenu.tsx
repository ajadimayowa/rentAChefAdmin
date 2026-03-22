import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import CustomButton from "../../custom-button/custom-button";
import ReusableInputs from "../../custom-input/ReusableInputs";
import api from "../../../app/api";
import { toast } from "react-toastify";

interface IEditModal {
  on: boolean;
  off: () => void;
  menu: any; // existing menu from backend
  onSuccess?: () => void;
}

const EditSpecialMenu: React.FC<IEditModal> = ({ on, off, menu, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const initialValues = {
    title: menu?.title || "",
    minimumGuests: menu?.minimumGuests || 1,
    numberOfDishes: menu?.numberOfDishes || 1,
    price: menu?.price ?? null,
    description: menu?.description || "",
    menuPic: null as File | null,
  };

  const validationSchema = Yup.object({
    title: Yup.string().required("Title is required").min(2, "Too short"),
    minimumGuests: Yup.number().min(1).required("Minimum guests required"),
    numberOfDishes: Yup.number().min(1).required("Number of dishes required"),
    price: Yup.number().typeError("Must be a number").min(0).required("Price is required"),
  });

  const updateMenu = async (values: any) => {
    setLoading(true);
    try {
      const formPayload = new FormData();

      formPayload.append("title", values.title);
      formPayload.append("minimumGuests", String(values.minimumGuests));
      formPayload.append("numberOfDishes", String(values.numberOfDishes));
      formPayload.append("price", String(values.price));
      formPayload.append("description", values.description || "");

      if (values.menuPic) {
        formPayload.append("menuPic", values.menuPic);
      }

      await api.put(`specialmenu/${menu?.id}`, formPayload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Special menu updated!");
      off();
      onSuccess && onSuccess();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal size="lg" show={on} onHide={off} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Special Menu</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={updateMenu}
          enableReinitialize
        >
          {({ values, handleSubmit, setFieldValue }) => (
            <Form onSubmit={handleSubmit}>
              <ReusableInputs label="Menu name" placeholder="Enter name of menu" inputType="text" name="title" id="title" />
              <ErrorMessage name="title" component="div" className="text-danger small mt-1" />

              <ReusableInputs label="Minimum guests" placeholder="Enter minimum number of guests" inputType="number-input" name="minimumGuests" id="minimumGuests" />
              <ErrorMessage name="minimumGuests" component="div" className="text-danger small mt-1" />

              <ReusableInputs label="Number of dishes" placeholder="Enter number of dishes" inputType="number-input" name="numberOfDishes" id="numberOfDishes" />
              <ErrorMessage name="numberOfDishes" component="div" className="text-danger small mt-1" />

              <ReusableInputs label="Base price (N)" placeholder="Enter base price" inputType="text" name="price" id="price" />
              <ErrorMessage name="price" component="div" className="text-danger small mt-1" />

              <ReusableInputs label="Description" placeholder="Enter description" inputType="text-input" name="description" id="description" />

              {/* Existing Image Preview */}
              {menu?.image && (
                <div className="mt-3">
                  <p className="fw-bold">Current Image</p>
                  <img src={menu.image} alt="menu" width={120} className="rounded" />
                </div>
              )}

              <p className="fw-bold mt-3">Change Menu Picture (optional)</p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFieldValue("menuPic", e.currentTarget.files?.[0])}
              />

              <CustomButton loading={loading} className="w-100 mt-3 text-light" title="Save changes" type="submit" />
            </Form>
          )}
        </Formik>
      </Modal.Body>
    </Modal>
  );
};

export default EditSpecialMenu;
