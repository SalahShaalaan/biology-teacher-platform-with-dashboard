import StudentDetailsClient from "./student-details-client";

export default async function StudentDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  return <StudentDetailsClient studentId={id} />;
}
