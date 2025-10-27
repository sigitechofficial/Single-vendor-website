import { useState } from "react";
import {
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
} from "@chakra-ui/react";

const SearchResultDrawer = ({ content }) => {
  const [drawer, setDrawer] = useState(true);

  return (
    <>
      <button
        onClick={() => setDrawer(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Open Drawer
      </button>
      <Drawer
        placement="top"
        onClose={() => setDrawer(false)}
        isOpen={drawer}
        size="md"
      >
        <DrawerOverlay />
        <DrawerContent className="rounded-b-xl w-full mt-20">
          <DrawerBody className="p-4">{content}</DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SearchResultDrawer;
