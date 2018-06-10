defmodule MyAppWeb.RoomChannel do
  use Phoenix.Channel
  alias MyAppWeb.Presence

  def join("room:lobby", _message, socket) do
    send(self(), :after_join)
    {:ok, socket}
  end

  def join("room:" <> _private_room_id, _params, _socket) do
    {:error, %{reason: "unauthorized"}}
  end

  def handle_in("new_msg", %{"body" => body}, socket) do
    IO.inspect "Received a new message: #{body}"
    broadcast! socket, "new_msg", %{body: body}
    push socket, "something", %{body: "some one-on-one message"}
    {:noreply, socket}
  end

  def handle_info(:after_join, socket) do
    push socket, "presence_state", Presence.list(socket)
    {:ok, _} = Presence.track(socket, :rand.uniform(10000), %{
      online_at: inspect(System.system_time(:seconds))
    })
    {:noreply, socket}
  end
end
