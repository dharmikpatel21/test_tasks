"use client";

import { Controller, FieldValues, useForm } from "react-hook-form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

type Props = {};

const SimpleForm = (props: Props) => {
  const { control, handleSubmit, getValues } = useForm({
    defaultValues: { name: "", email: "", password: "", cnfPassword: "" },
  });

  const submitForm = (data: FieldValues) => {
    console.log("====================================");
    console.log(data);
    console.log("====================================");
  };

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Simple Form</h1>
      <form onSubmit={handleSubmit(submitForm)} className="flex flex-col gap-4">
        <Controller
          control={control}
          name="name"
          rules={{
            required: {
              value: true,
              message: "name is required",
            },
          }}
          render={({ field, fieldState: { error } }) => {
            return (
              <div>
                <div>Name</div>
                <Input {...field} type="text" />
                {error && <span className="text-red-500">{error.message}</span>}
              </div>
            );
          }}
        />
        <Controller
          control={control}
          name="email"
          rules={{
            required: {
              value: true,
              message: "email is required",
            },
            pattern: {
              value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
              message: "Email must be valid",
            },
          }}
          render={({ field, fieldState: { error } }) => {
            return (
              <div>
                <div>Email</div>
                <Input {...field} type="email" />
                {error && <span className="text-red-500">{error.message}</span>}
              </div>
            );
          }}
        />
        <Controller
          control={control}
          name="password"
          rules={{
            required: {
              value: true,
              message: "password is required",
            },
            pattern: {
              value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
              message:
                " At least 8 characters, at least one letter and one number (no special character required).",
            },
          }}
          render={({ field, fieldState: { error } }) => {
            return (
              <div>
                <div>Password</div>
                <Input {...field} type="password" />
                {error && <span className="text-red-500">{error.message}</span>}
              </div>
            );
          }}
        />
        <Controller
          control={control}
          name="cnfPassword"
          rules={{
            required: {
              value: true,
              message: "Confirm Password is required",
            },
            validate: (value) =>
              getValues("password") === value || "Passwords must match",
          }}
          render={({ field, fieldState: { error } }) => {
            return (
              <div>
                <div>Confirm Password</div>
                <Input {...field} type="password" />
                {error && <span className="text-red-500">{error.message}</span>}
              </div>
            );
          }}
        />
        <Button variant={"default"} type="submit">
          Submit
        </Button>
      </form>
    </section>
  );
};

export default SimpleForm;
