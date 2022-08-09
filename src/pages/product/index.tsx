import { useEffect, useState } from "react";
import { Product } from "@prisma/client";
import { NextPage, GetServerSideProps } from "next";
import { getSession, useSession } from "next-auth/react";

import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { Spinner } from "@/components/Spinner";
import { trpc } from "@/utils/trpc";

const Product: NextPage = () => {
  const session = useSession();
  const products = trpc.useQuery(["product.getAll"]);

  const [productsState, setProductsState] = useState<Product[] | undefined>(
    undefined
  );

  useEffect(() => {
    setProductsState(products.data);
  }, [products]);

  if (
    !session ||
    !session.data ||
    !session.data.user ||
    !session.data.user.image
  )
    return <p>no session</p>;

  return (
    <div className="lg:h-max sm:h-max mx-auto my-auto bg-gray-900 w-full pb-4">
      <Navbar session={session.data} />
      {products.isLoading && (
        <div className="h-screen flex justify-center mt-4">
          <Spinner />
        </div>
      )}
      <div className="mt-4 lg:px-32 px-10 grid md:grid-rows-1 md:grid-flow-row lg:grid-cols-4 lg:grid-rows-4 gap-4">
        {products.status === "success" &&
          productsState &&
          productsState.map((product, index) => (
            <ProductCard
              key={index}
              name={product.name}
              barcode={product.barcode}
              price={Number(product.price)}
            />
          ))}
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx);
  if (!session) {
    return {
      redirect: {
        destination: "/api/auth/signin",
      },
      props: {},
    };
  }

  return {
    props: {
      session,
    },
  };
};

export default Product;
