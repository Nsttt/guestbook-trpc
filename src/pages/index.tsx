import type { NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import { useState } from "react";
import { trpc } from "../utils/trpc";

const Messages = () => {
  const { data: messages, isLoading } = trpc.useQuery([
    "guestbookgetAllMessages",
  ]);

  if (isLoading) return <div>Fetching...</div>;

  return (
    <div className="flex flex-col gap-4">
      {messages?.map((msg, index) => {
        return (
          <div key={index}>
            <p>{msg.message}</p>
            <span>- {msg.name}</span>
          </div>
        );
      })}
    </div>
  );
};

const Home: NextPage = () => {
  const { data: session, status } = useSession();

  const [message, setMessage] = useState("");
  const postMessage = trpc.useMutation("guestbookpostNewMessage", {});

  if (status === "loading") {
    return <main className="flex flex-col items-center pt-4">Loading...</main>;
  }

  return (
    <>
      <Head>
        <title>Nestor Guestbook</title>
        <meta name="description" content="A basic guestbook" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-3xl pt-4">Guestbook</h1>
        <div className="pt-10">
          {session ? (
            <div>
              <p>hi {session.user?.name}</p>
              <button onClick={() => signOut()}>Logout</button>
              <div className="pt-6">
                <form
                  className="flex gap-2"
                  onSubmit={(event) => {
                    event.preventDefault();

                    postMessage.mutate({
                      name: session.user?.name as string,
                      message,
                    });

                    setMessage("");
                  }}
                >
                  <input
                    type="text"
                    value={message}
                    placeholder="Your message"
                    maxLength={100}
                    onChange={(event) => setMessage(event.target.value)}
                    className="px-4 py-2 rounded-md border-2 border-zinc-800 bg-neutral-900 fecous:outline-none"
                  />
                  <button
                    type="submit"
                    className="p-2 rounded-md border-2 border-zinc-800 focus:outline-none"
                  >
                    Submit
                  </button>
                </form>
              </div>
              <div className="pt-10">
                <Messages />
              </div>
            </div>
          ) : (
            <div>
              <button onClick={() => signIn("discord")}>
                Login with Discord
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Home;
