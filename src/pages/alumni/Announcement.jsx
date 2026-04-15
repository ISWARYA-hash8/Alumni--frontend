import { useEffect, useMemo, useState } from "react";
import { getAnnouncements } from "../../services/apiService";
import Loader from "../../components/Loader";
import Pagination from "../../components/Pagination";

function Announcements(){

const [announcements,setAnnouncements] = useState([]);
const [loading,setLoading] = useState(true);
const [currentPage, setCurrentPage] = useState(1);
const pageSize = 6;

useEffect(()=>{

load();

},[]);

const load = async()=>{

const res = await getAnnouncements();
setAnnouncements(res.data);
setLoading(false);

};

const totalPages = Math.max(1, Math.ceil(announcements.length / pageSize));

useEffect(() => {
if(currentPage > totalPages){
setCurrentPage(totalPages);
}
}, [currentPage, totalPages]);

const paginatedAnnouncements = useMemo(() => {
const start = (currentPage - 1) * pageSize;
return announcements.slice(start, start + pageSize);
}, [announcements, currentPage]);

if(loading) return <Loader/>

return(

<div className="p-8 space-y-6">

<h1 className="text-3xl font-bold">
Announcements
</h1>

<div className="space-y-5">

{paginatedAnnouncements.map(a=>(

<div key={a.id} className="glass-card p-6 card-hover">

<h3 className="text-xl font-bold">
{a.title}
</h3>

<p className="text-gray-700 mt-2">
{a.content}
</p>

<div className="flex justify-between mt-3 text-sm text-purple-700">

<span>
{a.category} • {a.priority}
</span>

<span>
{new Date(a.createdAt).toLocaleDateString()}
</span>

</div>

</div>

))}

</div>

<Pagination
currentPage={currentPage}
totalPages={totalPages}
totalItems={announcements.length}
pageSize={pageSize}
itemLabel="announcements"
onPageChange={setCurrentPage}
/>

</div>

);

}

export default Announcements;
