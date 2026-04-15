import { useEffect, useMemo, useState } from "react";
import {
getAnnouncements,
createAnnouncement,
deleteAnnouncement
} from "../../services/apiService";
import Button from "../../components/Button";
import Pagination from "../../components/Pagination";

function Announcement(){

const [posts,setPosts] = useState([]);
const [currentPage, setCurrentPage] = useState(1);
const pageSize = 6;

const [form,setForm] = useState({
title:"",
content:"",
category:"General",
priority:"Medium"
});

useEffect(()=>{
loadPosts();
},[]);

const loadPosts = async()=>{
const res = await getAnnouncements();
setPosts(res.data);
};

const handleChange=(e)=>{
setForm({...form,[e.target.name]:e.target.value});
};

const createPost=async()=>{
if(!form.title || !form.content) return;

await createAnnouncement(form);

setForm({
title:"",
content:"",
category:"General",
priority:"Medium"
});

loadPosts();
};

const handleDelete=async(id)=>{
if(!window.confirm("Delete announcement?")) return;
await deleteAnnouncement(id);
loadPosts();
};

const totalPages = Math.max(1, Math.ceil(posts.length / pageSize));

useEffect(() => {
if(currentPage > totalPages){
setCurrentPage(totalPages);
}
}, [currentPage, totalPages]);

const paginatedPosts = useMemo(() => {
const start = (currentPage - 1) * pageSize;
return posts.slice(start, start + pageSize);
}, [currentPage, posts]);

return(

<div className="p-8 space-y-8">

<h1 className="text-3xl font-bold">
Announcements Manager
</h1>

<div className="glass-card p-6 space-y-4">

<input
name="title"
placeholder="Announcement title"
value={form.title}
onChange={handleChange}
className="glass-input w-full"
/>

<textarea
name="content"
placeholder="Announcement content"
value={form.content}
onChange={handleChange}
className="glass-input w-full"
/>

<div className="flex gap-4">

<select
name="category"
value={form.category}
onChange={handleChange}
className="glass-input"
>
<option>General</option>
<option>Career</option>
<option>Event</option>
</select>

<select
name="priority"
value={form.priority}
onChange={handleChange}
className="glass-input"
>
<option>Low</option>
<option>Medium</option>
<option>High</option>
</select>

<Button onClick={createPost}>
Publish
</Button>

</div>

</div>

<div className="grid md:grid-cols-2 gap-6">

{paginatedPosts.map(p=>(

<div key={p.id} className="glass-card p-6 card-hover">

<h3 className="text-xl font-bold">
{p.title}
</h3>

<p className="text-gray-900 mt-2">
{p.content}
</p>

<p className="text-sm text-indigo-900 mt-3">
{p.category} • {p.priority}
</p>

<div className="mt-4">

<Button
variant="danger"
onClick={()=>handleDelete(p.id)}
>
Delete
</Button>

</div>

</div>

))}

</div>

<Pagination
currentPage={currentPage}
totalPages={totalPages}
totalItems={posts.length}
pageSize={pageSize}
itemLabel="announcements"
onPageChange={setCurrentPage}
/>

</div>

);

}

export default Announcement;
