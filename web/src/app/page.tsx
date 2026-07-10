import { getContainer } from '@/domain-container';

export default function Home() {
  const users = getContainer().listUsers.execute();

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Planificador de Comidas</h1>
      <ul>
        {users.map(u => (
          <li key={u.id}>{u.name}</li>
        ))}
      </ul>
    </div>
  );
}
