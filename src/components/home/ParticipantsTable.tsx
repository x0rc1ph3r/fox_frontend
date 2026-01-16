interface Participant {
  id: number;
  userAddress:string;
  raffleId:number;
  quantity:number;
  user:{
    walletAddress:string;
    twitterId?:string | null;
    profileImage?:string | null;
  }
}

// const dummyParticipants: Participant[] = [
//   {
//     id: 1,
//     avatar: "/images/placeholder-user.png",
//     username: "@watchawill",
//     ticketsBought: 2,
//     juiceEarned: 6,
//     chance: 50,
//   },
//   {
//     id: 2,
//     avatar: "/images/placeholder-user.png",
//     username: "Izumal1",
//     ticketsBought: 2,
//     juiceEarned: 11,
//     chance: 25,
//   },
//   {
//     id: 3,
//     avatar: "/images/placeholder-user.png",
//     username: "supercookiesb",
//     ticketsBought: 2,
//     juiceEarned: 11,
//     chance: 25,
//   },
//     {
//     id: 4,
//     avatar: "/images/placeholder-user.png",
//     username: "supercookiesb",
//     ticketsBought: 2,
//     juiceEarned: 11,
//     chance: 25,
//   },
// ];

export const ParticipantsTable = ({
  participants,
  isLoading = false,
  ticketSupply
}: {
  participants?: Participant[];
  isLoading?: boolean;
  ticketSupply: number;
}) => {
  return (
    <div className="border border-gray-1100 md:pb-36 pb-24 rounded-[20px] w-full md:overflow-hidden overflow-x-auto">
      <table className="table w-full min-w-[600px]">
        <thead className="bg-gray-1300">
          <tr className="flex-1">
            <th className="text-base md:w-1/3 text-start font-inter text-gray-1600 font-medium md:px-10 px-4 py-7">
              User
            </th>
            <th className="text-base md:w-1/5 text-start font-inter text-gray-1600 font-medium">
              <div className="px-5 h-6 border-l border-gray-1600">
                Tickets bought
              </div>
            </th>
            {/* <th className="text-base md:w-1/5 text-start font-inter text-gray-1600 font-medium">
              <div className="px-5 h-6 border-l border-gray-1600">
                Juice earned
              </div>
            </th> */}
            <th className="text-base md:w-1/5 text-start font-inter text-gray-1600 font-medium">
              <div className="px-5 h-6 border-l border-gray-1600">
                Current chance
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          {isLoading ? (
            Array(3)
              .fill(0)
              .map((_, i) => (
                <tr key={i} className="flex-1 animate-pulse">
                  <td>
                    <div className="md:px-10 px-4 py-4 border-b border-gray-1100 flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-gray-300"></div>
                      <div className="h-4 w-24 bg-gray-300 rounded"></div>
                    </div>
                  </td>
                  <td>
                    <div className="px-5 py-6 border-b border-gray-1100">
                      <div className="h-4 w-6 bg-gray-300 rounded"></div>
                    </div>
                  </td>
                  <td>
                    <div className="px-5 py-6 border-b border-gray-1100">
                      <div className="h-4 w-6 bg-gray-300 rounded"></div>
                    </div>
                  </td>
                  <td>
                    <div className="px-5 py-6 border-b border-gray-1100">
                      <div className="h-4 w-12 bg-gray-300 rounded"></div>
                    </div>
                  </td>
                </tr>
              ))
          ) : (
            participants?.map((p) => (
              <tr key={p.id} className="flex-1">
                <td>
                  <div className="md:px-10 px-4 flex items-center gap-2.5 py-4 border-b border-gray-1100">
                    <img
                      src={p.user.profileImage ? p.user.profileImage : "/icons/user-avatar.png"}
                      className="w-10 h-10 rounded-full object-cover"
                      alt="user"
                    />
                    <p className="text-base text-black-1000 font-medium font-inter">
                      {p.userAddress.slice(0, 6)}...{p.userAddress.slice(-4)}
                    </p>
                  </div>
                </td>

                <td>
                  <div className="px-5 py-6 border-b border-gray-1100">
                    <p className="text-base text-black-1000 font-medium font-inter">
                      {p.quantity}
                    </p>
                  </div>
                </td>

                {/* <td>
                  <div className="px-5 py-6 border-b border-gray-1100">
                    <p className="text-base text-black-1000 font-medium font-inter">
                      {p.quantity}
                    </p>
                  </div>
                </td> */}

                <td>
                  <div className="px-5 py-6 border-b border-gray-1100">
                    <p className="text-base text-black-1000 font-medium font-inter">
                      {((p.quantity / ticketSupply) * 100).toFixed(2)}%
                    </p>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};