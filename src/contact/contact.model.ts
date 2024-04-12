export type ContactResponse = {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
};

export type CreateContactRequest = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
};
