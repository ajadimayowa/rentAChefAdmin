import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { Formik, Form, ErrorMessage, FieldArray, Field } from "formik";
import * as Yup from "yup";
import CustomButton from "../../custom-button/custom-button";
import ReusableInputs from "../../custom-input/ReusableInputs";
import api from "../../../app/api";
import { toast } from "react-toastify";

interface IUpdateModal {
  on: boolean;
  off: () => void;
  chefName: string;
  menu: any; // existing menu from backend
}

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const UpdateChefMenu: React.FC<IUpdateModal> = ({
  on,
  off,
  chefName,
  menu,
}) => {
  const [loading, setLoading] = useState(false);

  const initialValues = {
    chefId: menu?.chefId || "",
    month: menu?.month || "",
    createdBy: menu?.createdBy || "admin",
    menuPic: null as File | null,
    weeks: menu?.weeks || [],
  };

  const validationSchema = Yup.object({
    month: Yup.string()
      .matches(/^\d{4}-(0[1-9]|1[0-2])$/, "Format must be YYYY-MM")
      .required("Month is required"),

    weeks: Yup.array().of(
      Yup.object({
        days: Yup.array().of(
          Yup.object({
            breakfast: Yup.string().required("Required"),
            lunch: Yup.string().required("Required"),
            dinner: Yup.string().required("Required"),
          })
        ),
      })
    ),
  });

  const updateMenu = async (values: any) => {
    setLoading(true);
    try {
      const formPayload = new FormData();

      formPayload.append("chefId", values.chefId);
      formPayload.append("month", values.month);
      formPayload.append("createdBy", values.createdBy);
      formPayload.append("weeks", JSON.stringify(values.weeks));

      // Only send image if user selected a new one
      if (values.menuPic) {
        formPayload.append("menuPic", values.menuPic);
      }

      await api.put(`menu/update/${menu.id}`, formPayload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Menu updated successfully!");
      window.location.reload();
      off();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal size="lg" show={on} onHide={off} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {`Update Menu For ${chefName}`}
        </Modal.Title>
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
              
              {/* Month */}
              <ReusableInputs
                label="Month (YYYY-MM)"
                placeholder="2026-03"
                inputType="text"
                name="month"
                id="month"
              />
              <ErrorMessage name="month" component="div" className="text-danger small" />

              {/* Existing Image */}
              {menu?.menuPic && (
                <div className="mt-3">
                  <p className="fw-bold">Current Image</p>
                  <img
                    src={menu.menuPic}
                    alt="menu"
                    width={100}
                    className="rounded"
                  />
                </div>
              )}

              {/* Upload New Image */}
              <p className="fw-bold mt-3">Change Menu Picture (optional)</p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setFieldValue("menuPic", e.currentTarget.files?.[0])
                }
              />

              {/* Weeks */}
              <FieldArray name="weeks">
                {({ push, remove }) => (
                  <div className="mt-4">
                    {values.weeks.map((week: any, wIndex: number) => (
                      <div key={wIndex} className="border rounded p-3 mb-4">
                        <div className="d-flex justify-content-between">
                          <h6>Week {week.weekNumber}</h6>
                          {values.weeks.length > 1 && (
                            <button
                              type="button"
                              onClick={() => remove(wIndex)}
                              className="btn btn-sm btn-danger"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        {/* Days */}
                        {week.days.map((day: any, dIndex: number) => (
                          <div key={dIndex} className="mb-3">
                            <strong>{day.day}</strong>

                            <Field
                              name={`weeks.${wIndex}.days.${dIndex}.breakfast`}
                              className="form-control mt-1"
                              placeholder="Breakfast"
                            />
                            <Field
                              name={`weeks.${wIndex}.days.${dIndex}.lunch`}
                              className="form-control mt-1"
                              placeholder="Lunch"
                            />
                            <Field
                              name={`weeks.${wIndex}.days.${dIndex}.dinner`}
                              className="form-control mt-1"
                              placeholder="Dinner"
                            />
                          </div>
                        ))}
                      </div>
                    ))}

                    <button
                      type="button"
                      className="btn btn-outline-primary w-100"
                      onClick={() =>
                        push({
                          weekNumber: values.weeks.length + 1,
                          days: daysOfWeek.map((day) => ({
                            day,
                            breakfast: "",
                            lunch: "",
                            dinner: "",
                          })),
                        })
                      }
                    >
                      + Add Week
                    </button>
                  </div>
                )}
              </FieldArray>

              <CustomButton
                loading={loading}
                className="w-100 mt-4 text-light"
                title="Update Menu"
                type="submit"
              />
            </Form>
          )}
        </Formik>
      </Modal.Body>
    </Modal>
  );
};

export default UpdateChefMenu;