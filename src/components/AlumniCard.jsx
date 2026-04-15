import Button from "./Button";

function AlumniCard({alumni,onConnect,status}){

return(

<div className="glass-card p-6 card-hover">

<h3 className="text-xl font-bold">
{alumni.fullName}
</h3>

<p className="text-gray-900">
{alumni.profession}
</p>

<p className="text-gray-900">
{alumni.company}
</p>

<p className="text-gray-900">
📍 {alumni.location}
</p>

<p className="text-sm text-gray-700">
Batch {alumni.batchYear}
</p>

<div className="mt-4">

{status==="accepted" && (
<Button className="bg-green-600 w-full" disabled>
Connected
</Button>
)}

{status==="pending" && (
<Button className="bg-yellow-500 w-full" disabled>
Pending
</Button>
)}

{!status && (
<Button
onClick={onConnect}
className="w-full bg-indigo-600"
>
Connect
</Button>
)}

</div>

</div>

);

}

export default AlumniCard;